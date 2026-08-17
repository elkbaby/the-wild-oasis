import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useHotel } from "../../context/HotelContext";
import { createMaintenanceBlock as createMaintenanceBlockApi } from "../../services/apiBookings";

export function useCreateMaintenanceBlock() {
  const queryClient = useQueryClient();
  const { hotelId, selectedHotelId } = useHotel();

  const { mutate: createMaintenanceBlock, isLoading: isCreating } = useMutation({
    mutationFn: (block) => createMaintenanceBlockApi({ ...block, hotelId }),
    onSuccess: () => {
      toast.success("Maintenance block successfully created");
      queryClient.invalidateQueries({
        queryKey: ["hotels", selectedHotelId, "calendar"],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  return { createMaintenanceBlock, isCreating };
}
