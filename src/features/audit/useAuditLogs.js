import { useQuery } from "@tanstack/react-query";
import { useHotel } from "../../context/HotelContext";
import { getAuditLogs } from "../../services/apiAuditLogs";

export function useAuditLogs(action) {
  const { hotelId, selectedHotelId } = useHotel();
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["hotels", selectedHotelId, "audit", action],
    queryFn: () => getAuditLogs({ hotelId, action }),
  });

  return { logs, isLoading };
}
