import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createBooking as createBookingApi } from "../../services/apiBookings";
import { useHotel } from "../../context/HotelContext";

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { hotelId, selectedHotelId } = useHotel();

  const { mutate: createBooking, isLoading: isCreating } = useMutation({
    mutationFn: (booking) => {
      if (!hotelId)
        throw new Error("Run the multi-hotel database migration first");
      return createBookingApi({ ...booking, hotelId });
    },
    onSuccess: () => {
      toast.success("New booking successfully created");
      queryClient.invalidateQueries({
        queryKey: ["hotels", selectedHotelId],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  return { createBooking, isCreating };
}
