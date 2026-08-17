import { useQuery } from "@tanstack/react-query";
import { getSettings } from "../../services/apiSettings";
import { useHotel } from "../../context/HotelContext";

export function useSettings() {
  const { hotelId, selectedHotelId } = useHotel();
  const {
    isLoading,
    error,
    data: settings,
  } = useQuery({
    queryKey: ["hotels", selectedHotelId, "settings"],
    queryFn: () => getSettings(hotelId),
  });

  return { isLoading, error, settings };
}
