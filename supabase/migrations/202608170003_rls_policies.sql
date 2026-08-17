-- Step 3: replace broad "all authenticated users" policies with hotel-scoped RBAC.
-- Run only after 202608170001 and 202608170002 succeed.

grant usage on schema public to authenticated;
grant select on public.hotels, public.profiles, public.hotel_members to authenticated;
grant update on public.profiles to authenticated;
grant insert, update, delete on public.hotel_members to authenticated;
grant select, insert, update, delete on
  public.cabins,
  public.bookings,
  public.guests,
  public.settings,
  public.maintenance_blocks
to authenticated;
grant select on public.audit_logs to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter table public.hotels enable row level security;
alter table public.profiles enable row level security;
alter table public.hotel_members enable row level security;
alter table public.cabins enable row level security;
alter table public.bookings enable row level security;
alter table public.guests enable row level security;
alter table public.settings enable row level security;
alter table public.maintenance_blocks enable row level security;
alter table public.audit_logs enable row level security;

-- Existing permissive policies are OR-ed with new policies, so they must be removed.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any(array[
        'hotels',
        'profiles',
        'hotel_members',
        'cabins',
        'bookings',
        'guests',
        'settings',
        'maintenance_blocks',
        'audit_logs'
      ])
  loop
    execute format(
      'drop policy %I on public.%I',
      policy_record.policyname,
      policy_record.tablename
    );
  end loop;
end
$$;

create policy hotels_select_members
on public.hotels for select
to authenticated
using (public.is_hotel_member(id));

create policy profiles_select_shared_hotel
on public.profiles for select
to authenticated
using (public.shares_hotel(id));

create policy profiles_update_self
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy hotel_members_select_allowed
on public.hotel_members for select
to authenticated
using (
  "userId" = auth.uid()
  or public.has_hotel_role(
    "hotelId",
    array['owner', 'manager']::public.hotel_role[]
  )
);

create policy hotel_members_insert_owner
on public.hotel_members for insert
to authenticated
with check (
  public.has_hotel_role(
    "hotelId",
    array['owner']::public.hotel_role[]
  )
);

create policy hotel_members_update_owner
on public.hotel_members for update
to authenticated
using (
  public.has_hotel_role(
    "hotelId",
    array['owner']::public.hotel_role[]
  )
)
with check (
  public.has_hotel_role(
    "hotelId",
    array['owner']::public.hotel_role[]
  )
);

create policy hotel_members_delete_owner
on public.hotel_members for delete
to authenticated
using (
  public.has_hotel_role(
    "hotelId",
    array['owner']::public.hotel_role[]
  )
  and "userId" <> auth.uid()
);

create policy cabins_select_members
on public.cabins for select
to authenticated
using (public.is_hotel_member("hotelId"));

create policy cabins_insert_management
on public.cabins for insert
to authenticated
with check (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager']::public.hotel_role[]
  )
);

create policy cabins_update_management
on public.cabins for update
to authenticated
using (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager']::public.hotel_role[]
  )
)
with check (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager']::public.hotel_role[]
  )
);

create policy cabins_delete_management
on public.cabins for delete
to authenticated
using (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager']::public.hotel_role[]
  )
);

create policy bookings_select_members
on public.bookings for select
to authenticated
using (public.is_hotel_member("hotelId"));

create policy bookings_insert_operations
on public.bookings for insert
to authenticated
with check (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager', 'front_desk']::public.hotel_role[]
  )
);

create policy bookings_update_operations
on public.bookings for update
to authenticated
using (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager', 'front_desk']::public.hotel_role[]
  )
)
with check (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager', 'front_desk']::public.hotel_role[]
  )
);

create policy bookings_delete_management
on public.bookings for delete
to authenticated
using (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager']::public.hotel_role[]
  )
);

create policy guests_select_members
on public.guests for select
to authenticated
using (public.is_hotel_member("hotelId"));

create policy guests_insert_operations
on public.guests for insert
to authenticated
with check (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager', 'front_desk']::public.hotel_role[]
  )
);

create policy guests_update_operations
on public.guests for update
to authenticated
using (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager', 'front_desk']::public.hotel_role[]
  )
)
with check (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager', 'front_desk']::public.hotel_role[]
  )
);

create policy guests_delete_management
on public.guests for delete
to authenticated
using (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager']::public.hotel_role[]
  )
);

create policy settings_select_members
on public.settings for select
to authenticated
using (public.is_hotel_member("hotelId"));

create policy settings_insert_management
on public.settings for insert
to authenticated
with check (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager']::public.hotel_role[]
  )
);

create policy settings_update_management
on public.settings for update
to authenticated
using (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager']::public.hotel_role[]
  )
)
with check (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager']::public.hotel_role[]
  )
);

create policy maintenance_select_members
on public.maintenance_blocks for select
to authenticated
using (public.is_hotel_member("hotelId"));

create policy maintenance_insert_management
on public.maintenance_blocks for insert
to authenticated
with check (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager']::public.hotel_role[]
  )
);

create policy maintenance_update_management
on public.maintenance_blocks for update
to authenticated
using (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager']::public.hotel_role[]
  )
)
with check (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager']::public.hotel_role[]
  )
);

create policy maintenance_delete_management
on public.maintenance_blocks for delete
to authenticated
using (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager']::public.hotel_role[]
  )
);

create policy audit_select_authorized
on public.audit_logs for select
to authenticated
using (
  public.has_hotel_role(
    "hotelId",
    array['owner', 'manager', 'finance']::public.hotel_role[]
  )
);

-- Audit rows intentionally have no INSERT/UPDATE/DELETE policy for authenticated users.
-- Only the security-definer trigger can write them.
