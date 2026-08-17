import { useQuery } from "@tanstack/react-query";
import { useHotel } from "../../context/HotelContext";
import { getReportBookings } from "../../services/apiBookings";

export function useReportBookings(filters) {
  const { hotelId, selectedHotelId } = useHotel();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["hotels", selectedHotelId, "reports", filters],
    queryFn: () => getReportBookings({ ...filters, hotelId }),
  });

  return { bookings, isLoading };
}
