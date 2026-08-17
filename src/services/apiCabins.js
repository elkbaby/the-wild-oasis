//从supabase复制过来，可参考已有项目文件
import supabase, { supabaseUrl } from "./supabase";

export async function getCabins(hotelId) {
  let query = supabase.from("cabins").select("*");
  if (hotelId) query = query.eq("hotelId", hotelId);

  const { data, error } = await query;

  if (error) {
    console.error(error);
    throw new Error("Cabins could not be loaded");
  }

  return data;
}

/*
//supabase中复制的代码如下，多了最后一行009creating a new cabin
const { data, error } = await supabase
  .from('cabins')
  .insert([
    { some_column: 'someValue', other_column: 'otherValue' },
  ])
  .select()

*/

export async function createEditCabin(newCabin, id, hotelId) {
  const hasImagePath = newCabin.image?.startsWith?.(supabaseUrl);

  const imageName = hasImagePath
    ? null
    : `${hotelId ?? "legacy"}/${Math.random()}-${newCabin.image.name}`.replaceAll(
        "//",
        "/",
      );
  const imagePath = hasImagePath
    ? newCabin.image
    : `${supabaseUrl}/storage/v1/object/public/cabin-images/${imageName}`;

  // Upload first so a failed upload can never delete an existing cabin.
  if (!hasImagePath) {
    const { error: storageError } = await supabase.storage
      .from("cabin-images")
      .upload(imageName, newCabin.image);

    if (storageError) throw new Error("Cabin image could not be uploaded");
  }

  let query = supabase.from("cabins");
  const cabinData = { ...newCabin, image: imagePath };
  if (hotelId) cabinData.hotelId = hotelId;

  if (!id) query = query.insert([cabinData]);

  if (id) {
    query = query.update(cabinData).eq("id", id);
    if (hotelId) query = query.eq("hotelId", hotelId);
  }

  const { data, error } = await query.select().single();

  if (error) {
    if (!hasImagePath)
      await supabase.storage.from("cabin-images").remove([imageName]);
    console.error(error);
    throw new Error("Cabin could not be created");
  }

  return data;
}

export async function deleteCabin(id, hotelId) {
  /*
  //从supadata复制过来 可能与原项目不同
const { error } = await supabase
  .from('cabins')
  .delete()
  .eq('some_column', 'someValue')

 */
  //原项目是const { data, error }
  let query = supabase.from("cabins").delete().eq("id", id);
  if (hotelId) query = query.eq("hotelId", hotelId);
  const { data, error } = await query;

  if (error) {
    console.error(error);
    throw new Error("Cabin could not be deleted");
  }

  return data;
}
