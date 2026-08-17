import supabase from "./supabase";

export async function getSettings(hotelId) {
  let query = supabase.from("settings").select("*");
  query = hotelId ? query.eq("hotelId", hotelId) : query.eq("id", 1);
  const { data, error } = await query.single();

  if (error) {
    console.error(error);
    throw new Error("Settings could not be loaded");
  }
  return data;
}

// We expect a newSetting object that looks like {setting: newValue}
export async function updateSetting(newSetting, hotelId) {
  let query = supabase.from("settings").update(newSetting);
  query = hotelId ? query.eq("hotelId", hotelId) : query.eq("id", 1);
  const { data, error } = await query.select().single();

  if (error) {
    console.error(error);
    throw new Error("Settings could not be updated");
  }
  return data;
}
