import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getCalendarData } from "../../services/apiBookings";
import { useHotel } from "../../context/HotelContext";

export function useCalendarData(startDate, endDate) {
  const { hotelId, selectedHotelId } = useHotel();
  const from = format(startDate, "yyyy-MM-dd");
  const to = format(endDate, "yyyy-MM-dd");

  const { data, isLoading, error } = useQuery({
    queryKey: ["hotels", selectedHotelId, "calendar", from, to],
    queryFn: () => getCalendarData({ hotelId, startDate: from, endDate: to }),
  });

  return { data, isLoading, error };
}
