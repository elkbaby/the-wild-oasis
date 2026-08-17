-- Optional Step 4: scoped write policies for cabin images and avatars.
-- Before running, remove any old broad authenticated write policies on
-- Storage > Policies. A permissive old policy would override these restrictions.

drop policy if exists cabin_images_insert_management on storage.objects;
drop policy if exists cabin_images_update_management on storage.objects;
drop policy if exists cabin_images_delete_management on storage.objects;
drop policy if exists avatars_insert_self on storage.objects;
drop policy if exists avatars_update_self on storage.objects;
drop policy if exists avatars_delete_self on storage.objects;

create or replace function public.hotel_id_from_storage_path(object_name text)
returns bigint
language sql
stable
set search_path = public, storage
as $$
  select case
    when (storage.foldername(object_name))[1] ~ '^[0-9]+$'
      then ((storage.foldername(object_name))[1])::bigint
    else null
  end;
$$;

grant execute on function public.hotel_id_from_storage_path(text) to authenticated;

create policy cabin_images_insert_management
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'cabin-images'
  and public.has_hotel_role(
    public.hotel_id_from_storage_path(name),
    array['owner', 'manager']::public.hotel_role[]
  )
);

create policy cabin_images_update_management
on storage.objects for update
to authenticated
using (
  bucket_id = 'cabin-images'
  and public.has_hotel_role(
    public.hotel_id_from_storage_path(name),
    array['owner', 'manager']::public.hotel_role[]
  )
)
with check (
  bucket_id = 'cabin-images'
  and public.has_hotel_role(
    public.hotel_id_from_storage_path(name),
    array['owner', 'manager']::public.hotel_role[]
  )
);

create policy cabin_images_delete_management
on storage.objects for delete
to authenticated
using (
  bucket_id = 'cabin-images'
  and public.has_hotel_role(
    public.hotel_id_from_storage_path(name),
    array['owner', 'manager']::public.hotel_role[]
  )
);

create policy avatars_insert_self
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and name like 'avatar-' || auth.uid()::text || '-%'
);

create policy avatars_update_self
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and name like 'avatar-' || auth.uid()::text || '-%'
)
with check (
  bucket_id = 'avatars'
  and name like 'avatar-' || auth.uid()::text || '-%'
);

create policy avatars_delete_self
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and name like 'avatar-' || auth.uid()::text || '-%'
);
