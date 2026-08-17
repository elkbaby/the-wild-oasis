# Supabase migration and RLS setup

The application keeps its original single-hotel behavior until the database
migration is applied. Do not disable RLS and do not paste all files into one
SQL Editor query. Run and verify each step separately.

## 0. Back up and preflight

1. In Supabase, open **Database > Backups** and confirm a current backup exists.
2. Open **SQL Editor** and run the overlap check below. It must return zero rows
   before Step 2 can add the database exclusion constraint.

```sql
select
  first_booking.id as first_booking,
  second_booking.id as conflicting_booking,
  first_booking."cabinId"
from public.bookings first_booking
join public.bookings second_booking
  on first_booking.id < second_booking.id
 and first_booking."cabinId" = second_booking."cabinId"
 and first_booking.status <> 'cancelled'
 and second_booking.status <> 'cancelled'
 and daterange(first_booking."startDate"::date, first_booking."endDate"::date, '[)')
     && daterange(second_booking."startDate"::date, second_booking."endDate"::date, '[)');
```

If rows are returned, correct those booking dates before continuing.

## 1. Run the SQL files in order

Open each file, copy its complete contents into a new SQL Editor query, then
click **Run**. Only continue when the current file succeeds.

1. `supabase/migrations/202608170001_multi_hotel_schema.sql`
2. `supabase/migrations/202608170002_booking_workflows.sql`
3. `supabase/migrations/202608170003_rls_policies.sql`
4. `supabase/migrations/202608170004_storage_policies.sql` (after the Storage check below)
5. `supabase/migrations/202608170005_relationship_cleanup.sql`

Step 1 creates one default hotel and assigns all existing Auth users the
`owner` role for that hotel. It also attaches every existing cabin, booking,
guest, and settings row to that hotel, so existing data is preserved.

Step 5 removes the old single-column booking/cabin/guest relationships after
the stricter same-hotel composite relationships have been verified. This keeps
PostgREST nested selects unambiguous without weakening referential integrity.

## 2. Remove old broad Storage policies

Open **Storage > Policies**. For the `cabin-images` and `avatars` buckets,
remove old policies that give every authenticated user unrestricted INSERT,
UPDATE, or DELETE access. Then run Step 4. Keep both buckets public if existing
public image URLs should continue to work.

## 3. Verify the migration

Run:

```sql
select id, name, slug from public.hotels;

select hm."hotelId", p.email, hm.role
from public.hotel_members hm
join public.profiles p on p.id = hm."userId"
order by p.email;

select
  (select count(*) from public.cabins where "hotelId" is null) as cabins_without_hotel,
  (select count(*) from public.bookings where "hotelId" is null) as bookings_without_hotel,
  (select count(*) from public.guests where "hotelId" is null) as guests_without_hotel,
  (select count(*) from public.settings where "hotelId" is null) as settings_without_hotel;
```

All four `*_without_hotel` values must be `0`.

In **Database > Policies**, confirm that the old policies named like “Enable
read access for all users” are gone. The new policy names should start with
`hotels_`, `bookings_`, `cabins_`, `settings_`, and so on.

## 4. Assign roles

The first migration makes existing users owners to prevent accidental lockout.
After logging in, use the new **Users** page to change other users to `manager`,
`front_desk`, or `finance`. Keep at least one owner.

For a user created directly in the Supabase dashboard, add a hotel membership:

```sql
insert into public.hotel_members ("hotelId", "userId", role)
select
  (select id from public.hotels where slug = 'the-wild-oasis'),
  id,
  'front_desk'::public.hotel_role
from auth.users
where email = 'replace-with-user@example.com'
on conflict ("hotelId", "userId")
do update set role = excluded.role;
```

## 5. Test the security boundary

Create two hotels and assign a test user to only one of them. After logging in
as that user, the hotel selector and all API results should contain only the
assigned hotel. Test at least these role rules:

- `front_desk`: read/create/update bookings and check in/out; no settings,
  audit, exports, or cabin management.
- `finance`: read bookings/reports/audit and export; no booking or cabin writes.
- `manager`: manage bookings, cabins, settings, and maintenance; no user roles.
- `owner`: all application permissions, including role management.

The frontend hides unauthorized routes and buttons, while these RLS policies
remain the actual security boundary.
