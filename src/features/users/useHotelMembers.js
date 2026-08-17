import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useHotel } from "../../context/HotelContext";
import {
  getHotelMembers,
  updateHotelMemberRole,
} from "../../services/apiHotels";

export function useHotelMembers() {
  const { hotelId, selectedHotelId } = useHotel();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["hotel-members", selectedHotelId],
    queryFn: () => getHotelMembers(hotelId),
  });

  return { members, isLoading };
}

export function useUpdateHotelMember() {
  const queryClient = useQueryClient();
  const { hotelId, selectedHotelId } = useHotel();

  const { mutate: updateRole, isLoading: isUpdating } = useMutation({
    mutationFn: ({ memberId, role }) =>
      updateHotelMemberRole({ memberId, role, hotelId }),
    onSuccess: () => {
      toast.success("Team member role successfully updated");
      queryClient.invalidateQueries({
        queryKey: ["hotel-members", selectedHotelId],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  return { updateRole, isUpdating };
}
