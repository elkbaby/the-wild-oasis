import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBookings } from "../../services/apiBookings";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";
import { useHotel } from "../../context/HotelContext";

export function useBookings() {
  const queryClient = useQueryClient();
  const { hotelId, selectedHotelId } = useHotel();
  const [searchParams] = useSearchParams();

  // FILTER
  const filterValue = searchParams.get("status");
  const filter =
    !filterValue || filterValue === "all"
      ? null
      : { field: "status", value: filterValue };
  // { field: "totalPrice", value: 5000, method: "gte" };

  // SORT
  const sortByRaw = searchParams.get("sortBy") || "startDate-desc";
  const [field, direction] = sortByRaw.split("-");
  const sortBy = { field, direction };

  // PAGINATION
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  // QUERY
  const {
    isLoading,
    data: { data: bookings = [], count = 0 } = {},
    error,
  } = useQuery({
    queryKey: ["hotels", selectedHotelId, "bookings", filter, sortBy, page],
    queryFn: () => getBookings({ filter, sortBy, page, hotelId }),
  });

  // PRE-FETCHING
  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount)
    queryClient.prefetchQuery({
      queryKey: [
        "hotels",
        selectedHotelId,
        "bookings",
        filter,
        sortBy,
        page + 1,
      ],
      queryFn: () =>
        getBookings({ filter, sortBy, page: page + 1, hotelId }),
    });

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: [
        "hotels",
        selectedHotelId,
        "bookings",
        filter,
        sortBy,
        page - 1,
      ],
      queryFn: () =>
        getBookings({ filter, sortBy, page: page - 1, hotelId }),
    });

  return { isLoading, error, bookings, count };
}
