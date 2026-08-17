import supabase from "./supabase";

const LEGACY_HOTEL = {
  id: "legacy",
  name: "The Wild Oasis",
  location: "Default hotel",
  timezone: "UTC",
  role: "owner",
  isLegacy: true,
};

export async function getHotelMemberships(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("hotel_members")
    .select("role, hotelId, hotels(id, name, location, timezone)")
    .eq("userId", userId);

  // Keep the original single-hotel project usable until the migration is run.
  if (error?.code === "42P01" || error?.code === "PGRST205") {
    return [LEGACY_HOTEL];
  }

  if (error) throw new Error("Hotels could not be loaded");

  return data.map((membership) => ({
    ...membership.hotels,
    id: membership.hotelId,
    role: membership.role,
    isLegacy: false,
  }));
}

export async function getHotelMembers(hotelId) {
  if (!hotelId || hotelId === "legacy") return [];

  const { data, error } = await supabase
    .from("hotel_members")
    .select("id, userId, role, profiles(fullName, email)")
    .eq("hotelId", hotelId)
    .order("created_at");

  if (error) throw new Error("Team members could not be loaded");
  return data;
}

export async function updateHotelMemberRole({ memberId, role, hotelId }) {
  const { data, error } = await supabase
    .from("hotel_members")
    .update({ role })
    .eq("id", memberId)
    .eq("hotelId", hotelId)
    .select()
    .single();

  if (error) throw new Error("Team member role could not be updated");
  return data;
}

export { LEGACY_HOTEL };
