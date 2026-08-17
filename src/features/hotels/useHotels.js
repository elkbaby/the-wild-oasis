import { useQuery } from "@tanstack/react-query";
import { getHotelMemberships } from "../../services/apiHotels";
import { useUser } from "../authentication/useUser";

export function useHotels() {
  const { user } = useUser();

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ["hotels", user?.id],
    queryFn: () => getHotelMemberships(user.id),
    enabled: Boolean(user?.id),
  });

  return { hotels, isLoading };
}
