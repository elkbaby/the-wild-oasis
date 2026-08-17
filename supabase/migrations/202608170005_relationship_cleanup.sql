-- Step 5: remove legacy single-column foreign keys that are superseded by
-- hotel-scoped composite foreign keys. Keeping both relationships makes
-- PostgREST embeds such as bookings -> guests/cabins ambiguous.

begin;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bookings_cabin_same_hotel_fkey'
      and conrelid = 'public.bookings'::regclass
  ) then
    raise exception 'Required constraint bookings_cabin_same_hotel_fkey is missing';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'bookings_guest_same_hotel_fkey'
      and conrelid = 'public.bookings'::regclass
  ) then
    raise exception 'Required constraint bookings_guest_same_hotel_fkey is missing';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'maintenance_cabin_same_hotel_fkey'
      and conrelid = 'public.maintenance_blocks'::regclass
  ) then
    raise exception 'Required constraint maintenance_cabin_same_hotel_fkey is missing';
  end if;
end
$$;

alter table public.bookings
  drop constraint if exists "bookings_cabinId_fkey";

alter table public.bookings
  drop constraint if exists "bookings_guestId_fkey";

alter table public.maintenance_blocks
  drop constraint if exists "maintenance_blocks_cabinId_fkey";

commit;

-- Refresh PostgREST's relationship cache immediately after the DDL change.
notify pgrst, 'reload schema';
