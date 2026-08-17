import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { rescheduleBooking as rescheduleBookingApi } from "../../services/apiBookings";
import { useHotel } from "../../context/HotelContext";

export function useRescheduleBooking() {
  const queryClient = useQueryClient();
  const { hotelId, selectedHotelId } = useHotel();

  const { mutate: rescheduleBooking, isLoading: isRescheduling } = useMutation({
    mutationFn: (booking) =>
      rescheduleBookingApi({ ...booking, hotelId }),
    onSuccess: () => {
      toast.success("Booking dates successfully updated");
      queryClient.invalidateQueries({
        queryKey: ["hotels", selectedHotelId],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  return { rescheduleBooking, isRescheduling };
}
