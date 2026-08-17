import { useQuery } from "@tanstack/react-query";
import { getStaysTodayActivity } from "../../services/apiBookings";
import { useHotel } from "../../context/HotelContext";

export function useTodayActivity() {
  const { hotelId, selectedHotelId } = useHotel();
  const { isLoading, data: activities = [] } = useQuery({
    queryFn: () => getStaysTodayActivity(hotelId),
    queryKey: ["hotels", selectedHotelId, "today-activity"],
  });

  return { activities, isLoading };
}
