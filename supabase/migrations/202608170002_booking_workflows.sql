-- Step 2: authorization helpers, conflict constraints, transactional RPCs,
-- and immutable audit logging.

create or replace function public.is_hotel_member(p_hotel_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.hotel_members
    where "hotelId" = p_hotel_id
      and "userId" = auth.uid()
  );
$$;

create or replace function public.has_hotel_role(
  p_hotel_id bigint,
  p_roles public.hotel_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.hotel_members
    where "hotelId" = p_hotel_id
      and "userId" = auth.uid()
      and role = any(p_roles)
  );
$$;

create or replace function public.shares_hotel(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_user_id = auth.uid() or exists (
    select 1
    from public.hotel_members mine
    join public.hotel_members theirs
      on theirs."hotelId" = mine."hotelId"
    where mine."userId" = auth.uid()
      and theirs."userId" = p_user_id
      and mine.role in ('owner', 'manager')
  );
$$;

grant execute on function public.is_hotel_member(bigint) to authenticated;
grant execute on function public.has_hotel_role(bigint, public.hotel_role[]) to authenticated;
grant execute on function public.shares_hotel(uuid) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookings_no_overlap'
  ) then
    alter table public.bookings
      add constraint bookings_no_overlap
      exclude using gist (
        "hotelId" with =,
        "cabinId" with =,
        daterange("startDate"::date, "endDate"::date, '[)') with &&
      )
      where (status <> 'cancelled');
  end if;
end
$$;

create or replace function public.create_booking(
  p_hotel_id bigint,
  p_cabin_id bigint,
  p_start_date date,
  p_end_date date,
  p_num_guests integer,
  p_has_breakfast boolean,
  p_is_paid boolean,
  p_observations text,
  p_guest_name text,
  p_guest_email text,
  p_guest_nationality text,
  p_guest_national_id text
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_cabin public.cabins%rowtype;
  v_booking public.bookings%rowtype;
  v_guest_id bigint;
  v_nights integer;
  v_cabin_price numeric;
  v_extras_price numeric := 0;
  v_breakfast_price numeric := 0;
begin
  if not public.has_hotel_role(
    p_hotel_id,
    array['owner', 'manager', 'front_desk']::public.hotel_role[]
  ) then
    raise exception 'Not allowed to create bookings for this hotel' using errcode = '42501';
  end if;

  if p_end_date <= p_start_date then
    raise exception 'Check-out must be after check-in' using errcode = '22007';
  end if;

  select * into v_cabin
  from public.cabins
  where id = p_cabin_id and "hotelId" = p_hotel_id;

  if not found then
    raise exception 'Cabin does not belong to this hotel' using errcode = '23503';
  end if;

  if p_num_guests < 1 or p_num_guests > v_cabin."maxCapacity" then
    raise exception 'Guest count exceeds cabin capacity' using errcode = '23514';
  end if;

  if exists (
    select 1 from public.maintenance_blocks
    where "hotelId" = p_hotel_id
      and "cabinId" = p_cabin_id
      and daterange("startDate", "endDate", '[)') && daterange(p_start_date, p_end_date, '[)')
  ) then
    raise exception 'Booking overlaps a maintenance block' using errcode = '23P01';
  end if;

  select id into v_guest_id
  from public.guests
  where "hotelId" = p_hotel_id and lower(email) = lower(p_guest_email)
  order by id
  limit 1;

  if v_guest_id is null then
    insert into public.guests (
      "hotelId", "fullName", email, nationality, "nationalID", "countryFlag"
    ) values (
      p_hotel_id,
      p_guest_name,
      lower(p_guest_email),
      p_guest_nationality,
      p_guest_national_id,
      ''
    ) returning id into v_guest_id;
  end if;

  v_nights := p_end_date - p_start_date;
  v_cabin_price := (v_cabin."regularPrice" - coalesce(v_cabin.discount, 0)) * v_nights;

  if p_has_breakfast then
    select coalesce("breakfastPrice", 0) into v_breakfast_price
    from public.settings
    where "hotelId" = p_hotel_id;
    v_extras_price := coalesce(v_breakfast_price, 0) * v_nights * p_num_guests;
  end if;

  insert into public.bookings (
    "hotelId",
    "cabinId",
    "guestId",
    "startDate",
    "endDate",
    "numNights",
    "numGuests",
    "cabinPrice",
    "extrasPrice",
    "totalPrice",
    "hasBreakfast",
    "isPaid",
    observations,
    status
  ) values (
    p_hotel_id,
    p_cabin_id,
    v_guest_id,
    p_start_date,
    p_end_date,
    v_nights,
    p_num_guests,
    v_cabin_price,
    v_extras_price,
    v_cabin_price + v_extras_price,
    p_has_breakfast,
    p_is_paid,
    coalesce(p_observations, ''),
    'unconfirmed'
  ) returning * into v_booking;

  return to_jsonb(v_booking);
end;
$$;

create or replace function public.reschedule_booking(
  p_booking_id bigint,
  p_hotel_id bigint,
  p_cabin_id bigint,
  p_start_date date,
  p_end_date date
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_cabin public.cabins%rowtype;
  v_nights integer;
  v_cabin_price numeric;
  v_extras_price numeric := 0;
  v_breakfast_price numeric := 0;
begin
  if not public.has_hotel_role(
    p_hotel_id,
    array['owner', 'manager', 'front_desk']::public.hotel_role[]
  ) then
    raise exception 'Not allowed to update bookings for this hotel' using errcode = '42501';
  end if;

  if p_end_date <= p_start_date then
    raise exception 'Check-out must be after check-in' using errcode = '22007';
  end if;

  select * into v_booking
  from public.bookings
  where id = p_booking_id and "hotelId" = p_hotel_id
  for update;

  if not found then
    raise exception 'Booking not found' using errcode = 'P0002';
  end if;

  if v_booking.status = 'checked-out' then
    raise exception 'Checked-out bookings cannot be rescheduled' using errcode = '23514';
  end if;

  select * into v_cabin
  from public.cabins
  where id = p_cabin_id and "hotelId" = p_hotel_id;

  if not found then
    raise exception 'Cabin does not belong to this hotel' using errcode = '23503';
  end if;

  if v_booking."numGuests" > v_cabin."maxCapacity" then
    raise exception 'Guest count exceeds the new cabin capacity' using errcode = '23514';
  end if;

  if exists (
    select 1 from public.maintenance_blocks
    where "hotelId" = p_hotel_id
      and "cabinId" = p_cabin_id
      and daterange("startDate", "endDate", '[)') && daterange(p_start_date, p_end_date, '[)')
  ) then
    raise exception 'Booking overlaps a maintenance block' using errcode = '23P01';
  end if;

  v_nights := p_end_date - p_start_date;
  v_cabin_price := (v_cabin."regularPrice" - coalesce(v_cabin.discount, 0)) * v_nights;

  if v_booking."hasBreakfast" then
    select coalesce("breakfastPrice", 0) into v_breakfast_price
    from public.settings
    where "hotelId" = p_hotel_id;
    v_extras_price := coalesce(v_breakfast_price, 0) * v_nights * v_booking."numGuests";
  end if;

  update public.bookings
  set "cabinId" = p_cabin_id,
      "startDate" = p_start_date,
      "endDate" = p_end_date,
      "numNights" = v_nights,
      "cabinPrice" = v_cabin_price,
      "extrasPrice" = v_extras_price,
      "totalPrice" = v_cabin_price + v_extras_price
  where id = p_booking_id and "hotelId" = p_hotel_id
  returning * into v_booking;

  return to_jsonb(v_booking);
end;
$$;

create or replace function public.create_maintenance_block(
  p_hotel_id bigint,
  p_cabin_id bigint,
  p_start_date date,
  p_end_date date,
  p_reason text
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_block public.maintenance_blocks%rowtype;
begin
  if not public.has_hotel_role(
    p_hotel_id,
    array['owner', 'manager']::public.hotel_role[]
  ) then
    raise exception 'Not allowed to manage maintenance for this hotel' using errcode = '42501';
  end if;

  if p_end_date <= p_start_date then
    raise exception 'End date must be after start date' using errcode = '22007';
  end if;

  if not exists (
    select 1 from public.cabins
    where id = p_cabin_id and "hotelId" = p_hotel_id
  ) then
    raise exception 'Cabin does not belong to this hotel' using errcode = '23503';
  end if;

  if exists (
    select 1 from public.bookings
    where "hotelId" = p_hotel_id
      and "cabinId" = p_cabin_id
      and status <> 'cancelled'
      and daterange("startDate"::date, "endDate"::date, '[)') && daterange(p_start_date, p_end_date, '[)')
  ) then
    raise exception 'Maintenance overlaps a booking' using errcode = '23P01';
  end if;

  insert into public.maintenance_blocks (
    "hotelId", "cabinId", "startDate", "endDate", reason, "createdBy"
  ) values (
    p_hotel_id, p_cabin_id, p_start_date, p_end_date, p_reason, auth.uid()
  ) returning * into v_block;

  return to_jsonb(v_block);
end;
$$;

grant execute on function public.create_booking(
  bigint, bigint, date, date, integer, boolean, boolean, text, text, text, text, text
) to authenticated;
grant execute on function public.reschedule_booking(bigint, bigint, bigint, date, date)
  to authenticated;
grant execute on function public.create_maintenance_block(bigint, bigint, date, date, text)
  to authenticated;

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before jsonb;
  v_after jsonb;
  v_row jsonb;
  v_hotel_id bigint;
  v_resource_id text;
begin
  v_before := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end;
  v_after := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end;
  v_row := coalesce(v_after, v_before);
  v_hotel_id := nullif(v_row ->> 'hotelId', '')::bigint;
  v_resource_id := coalesce(v_row ->> 'id', 'unknown');

  insert into public.audit_logs (
    "hotelId", "actorId", action, "resourceType", "resourceId", "beforeData", "afterData"
  ) values (
    v_hotel_id, auth.uid(), tg_op, tg_table_name, v_resource_id, v_before, v_after
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'bookings',
    'cabins',
    'settings',
    'hotel_members',
    'maintenance_blocks'
  ]
  loop
    execute format('drop trigger if exists audit_%I on public.%I', table_name, table_name);
    execute format(
      'create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.write_audit_log()',
      table_name,
      table_name
    );
  end loop;
end
$$;
