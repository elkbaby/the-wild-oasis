import supabase from "./supabase";

export async function getAuditLogs({ hotelId, action }) {
  if (!hotelId) return [];

  let query = supabase
    .from("audit_logs")
    .select("*, profiles(fullName, email)")
    .eq("hotelId", hotelId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (action && action !== "all") query = query.eq("action", action);

  const { data, error } = await query;
  if (error?.code === "42P01" || error?.code === "PGRST205") return [];
  if (error) throw new Error("Audit log could not be loaded");
  return data;
}
