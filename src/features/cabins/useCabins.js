import { useQuery } from "@tanstack/react-query";
import { getCabins } from "../../services/apiCabins";
import { useHotel } from "../../context/HotelContext";

export function useCabins() {
  const { hotelId, selectedHotelId } = useHotel();
  const {
    isLoading,
    data: cabins = [],
    error,
  } = useQuery({
    queryKey: ["hotels", selectedHotelId, "cabins"],
    queryFn: () => getCabins(hotelId),
  });

  return { isLoading, error, cabins };
}
