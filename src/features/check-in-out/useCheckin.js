import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBooking } from "../../services/apiBookings";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useHotel } from "../../context/HotelContext";

export function useCheckin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { hotelId, selectedHotelId } = useHotel();

  const { mutate: checkin, isLoading: isCheckingIn } = useMutation({
    mutationFn: ({ bookingId, breakfast }) =>
      updateBooking(
        bookingId,
        {
          status: "checked-in",
          isPaid: true,
          ...breakfast,
        },
        hotelId,
      ),

    onSuccess: (data) => {
      toast.success(`Booking #${data.id} successfully checked in`);
      queryClient.invalidateQueries({
        queryKey: ["hotels", selectedHotelId],
      });
      navigate("/");
    },

    onError: () => toast.error("There was an error while checking in"),
  });

  return { checkin, isCheckingIn };
}
