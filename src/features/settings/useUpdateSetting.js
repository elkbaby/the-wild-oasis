import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updateSetting as updateSettingApi } from "../../services/apiSettings";
import { useHotel } from "../../context/HotelContext";

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  const { hotelId, selectedHotelId } = useHotel();

  const { mutate: updateSetting, isLoading: isUpdating } = useMutation({
    mutationFn: (setting) => updateSettingApi(setting, hotelId),
    onSuccess: () => {
      toast.success("Setting successfully edited");
      queryClient.invalidateQueries({
        queryKey: ["hotels", selectedHotelId, "settings"],
      });
    },
    onError: (err) => toast.error(err.message),
  });

  return { isUpdating, updateSetting };
}
