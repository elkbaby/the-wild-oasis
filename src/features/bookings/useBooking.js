import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getBooking } from "../../services/apiBookings";
import { useHotel } from "../../context/HotelContext";

export function useBooking() {
  const { bookingId } = useParams();
  const { hotelId, selectedHotelId } = useHotel();

  const {
    isLoading,
    data: booking,
    error,
  } = useQuery({
    queryKey: ["hotels", selectedHotelId, "booking", bookingId],
    queryFn: () => getBooking(bookingId, hotelId),
    retry: false,
  });

  return { isLoading, error, booking };
}
