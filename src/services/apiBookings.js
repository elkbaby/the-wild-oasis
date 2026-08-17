import { getToday } from "../utils/helpers";
import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

function scopeToHotel(query, hotelId) {
  return hotelId ? query.eq("hotelId", hotelId) : query;
}

export async function getBookings({ filter, sortBy, page, hotelId }) {
  let query = supabase
    .from("bookings")
    .select(
      "id, created_at, startDate, endDate, numNights, numGuests, status, totalPrice, cabins(name), guests(fullName, email)",
      { count: "exact" }
    );

  query = scopeToHotel(query, hotelId);

  // FILTER
  if (filter) query = query[filter.method || "eq"](filter.field, filter.value);

  // SORT
  if (sortBy)
    query = query.order(sortBy.field, {
      ascending: sortBy.direction === "asc",
    });

  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
    throw new Error("Bookings could not be loaded");
  }

  return { data, count };
}

export async function getBooking(id, hotelId) {
  let query = supabase
    .from("bookings")
    .select("*, cabins(*), guests(*)")
    .eq("id", id);
  query = scopeToHotel(query, hotelId);
  const { data, error } = await query.single();

  if (error) {
    console.error(error);
    throw new Error("Booking not found");
  }

  return data;
}

// Returns all BOOKINGS that are were created after the given date. Useful to get bookings created in the last 30 days, for example.
// date: ISOString
export async function getBookingsAfterDate(date, hotelId) {
  let query = supabase
    .from("bookings")
    .select("created_at, totalPrice, extrasPrice")
    .gte("created_at", date)
    .lte("created_at", getToday({ end: true }));
  query = scopeToHotel(query, hotelId);
  const { data, error } = await query;

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

// Returns all STAYS that are were created after the given date
export async function getStaysAfterDate(date, hotelId) {
  let query = supabase
    .from("bookings")
    .select("*, guests(fullName)")
    .gte("startDate", date)
    .lte("startDate", getToday());
  query = scopeToHotel(query, hotelId);
  const { data, error } = await query;

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

// Activity means that there is a check in or a check out today
export async function getStaysTodayActivity(hotelId) {
  let query = supabase
    .from("bookings")
    .select("*, guests(fullName, nationality, countryFlag)")
    .or(
      `and(status.eq.unconfirmed,startDate.eq.${getToday()}),and(status.eq.checked-in,endDate.eq.${getToday()})`
    )
    .order("created_at");
  query = scopeToHotel(query, hotelId);
  const { data, error } = await query;

  // Equivalent to this. But by querying this, we only download the data we actually need, otherwise we would need ALL bookings ever created
  // (stay.status === 'unconfirmed' && isToday(new Date(stay.startDate))) ||
  // (stay.status === 'checked-in' && isToday(new Date(stay.endDate)))

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }
  return data;
}

export async function updateBooking(id, obj, hotelId) {
  let query = supabase
    .from("bookings")
    .update(obj)
    .eq("id", id);
  query = scopeToHotel(query, hotelId);
  const { data, error } = await query.select().single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  return data;
}

export async function deleteBooking(id, hotelId) {
  // REMEMBER RLS POLICIES
  let query = supabase.from("bookings").delete().eq("id", id);
  query = scopeToHotel(query, hotelId);
  const { data, error } = await query;

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }
  return data;
}

export async function getCalendarData({ hotelId, startDate, endDate }) {
  let cabinsQuery = supabase.from("cabins").select("*").order("name");
  cabinsQuery = scopeToHotel(cabinsQuery, hotelId);

  let bookingsQuery = supabase
    .from("bookings")
    .select("*, guests(fullName), cabins(name)")
    .lt("startDate", endDate)
    .gt("endDate", startDate)
    .neq("status", "cancelled")
    .order("startDate");
  bookingsQuery = scopeToHotel(bookingsQuery, hotelId);

  let maintenanceQuery = supabase
    .from("maintenance_blocks")
    .select("*")
    .lt("startDate", endDate)
    .gt("endDate", startDate)
    .order("startDate");
  maintenanceQuery = scopeToHotel(maintenanceQuery, hotelId);

  const [cabinsResult, bookingsResult, maintenanceResult] = await Promise.all([
    cabinsQuery,
    bookingsQuery,
    maintenanceQuery,
  ]);

  if (cabinsResult.error || bookingsResult.error)
    throw new Error("Room calendar could not be loaded");

  const maintenanceTableMissing =
    maintenanceResult.error?.code === "42P01" ||
    maintenanceResult.error?.code === "PGRST205";

  if (maintenanceResult.error && !maintenanceTableMissing)
    throw new Error("Maintenance blocks could not be loaded");

  return {
    cabins: cabinsResult.data,
    bookings: bookingsResult.data,
    maintenanceBlocks: maintenanceTableMissing ? [] : maintenanceResult.data,
  };
}

export async function createBooking(newBooking) {
  const { data, error } = await supabase.rpc("create_booking", {
    p_hotel_id: newBooking.hotelId,
    p_cabin_id: Number(newBooking.cabinId),
    p_start_date: newBooking.startDate,
    p_end_date: newBooking.endDate,
    p_num_guests: Number(newBooking.numGuests),
    p_has_breakfast: Boolean(newBooking.hasBreakfast),
    p_is_paid: Boolean(newBooking.isPaid),
    p_observations: newBooking.observations || "",
    p_guest_name: newBooking.fullName,
    p_guest_email: newBooking.email,
    p_guest_nationality: newBooking.nationality,
    p_guest_national_id: newBooking.nationalID,
  });

  if (error) {
    if (error.code === "23P01" || error.message?.includes("overlap"))
      throw new Error("This cabin is not available for the selected dates");
    throw new Error(error.message || "Booking could not be created");
  }

  return data;
}

export async function rescheduleBooking({
  bookingId,
  hotelId,
  cabinId,
  startDate,
  endDate,
}) {
  const { data, error } = await supabase.rpc("reschedule_booking", {
    p_booking_id: bookingId,
    p_hotel_id: hotelId,
    p_cabin_id: Number(cabinId),
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) {
    if (error.code === "23P01" || error.message?.includes("overlap"))
      throw new Error("The new dates conflict with another booking");
    throw new Error(error.message || "Booking could not be rescheduled");
  }

  return data;
}

export async function getReportBookings({ hotelId, from, to, status }) {
  let query = supabase
    .from("bookings")
    .select(
      "id, created_at, startDate, endDate, numNights, numGuests, status, isPaid, cabinPrice, extrasPrice, totalPrice, cabins(name), guests(fullName, email)",
    )
    .gte("startDate", from)
    .lte("startDate", to)
    .order("startDate", { ascending: false });

  query = scopeToHotel(query, hotelId);
  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error("Report could not be loaded");
  return data;
}

export async function createMaintenanceBlock(block) {
  const { data, error } = await supabase.rpc("create_maintenance_block", {
    p_hotel_id: block.hotelId,
    p_cabin_id: Number(block.cabinId),
    p_start_date: block.startDate,
    p_end_date: block.endDate,
    p_reason: block.reason,
  });

  if (error) {
    if (error.code === "23P01" || error.message?.includes("overlap"))
      throw new Error("The maintenance period conflicts with a booking");
    throw new Error(error.message || "Maintenance block could not be created");
  }

  return data;
}
