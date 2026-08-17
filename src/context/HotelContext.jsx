import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useHotels } from "../features/hotels/useHotels";
import {
  ROLE_LABELS,
  ROLE_PERMISSIONS,
} from "../features/hotels/permissions";
import Spinner from "../ui/Spinner";

const HotelContext = createContext();

function HotelProvider({ children }) {
  const { hotels, isLoading } = useHotels();
  const [selectedHotelId, setSelectedHotelId] = useState(() =>
    localStorage.getItem("selectedHotelId"),
  );

  useEffect(() => {
    if (!hotels.length) return;

    const selectedHotelExists = hotels.some(
      (hotel) => String(hotel.id) === String(selectedHotelId),
    );

    if (!selectedHotelExists) setSelectedHotelId(String(hotels[0].id));
  }, [hotels, selectedHotelId]);

  useEffect(() => {
    if (selectedHotelId)
      localStorage.setItem("selectedHotelId", selectedHotelId);
  }, [selectedHotelId]);

  const hotel =
    hotels.find((item) => String(item.id) === String(selectedHotelId)) ??
    hotels[0];
  const effectiveHotelId = hotel ? String(hotel.id) : selectedHotelId;

  const value = useMemo(() => {
    const role = hotel?.role;
    const permissions = ROLE_PERMISSIONS[role] ?? [];

    return {
      hotels,
      hotel,
      hotelId: hotel?.isLegacy ? null : hotel?.id,
      selectedHotelId: effectiveHotelId,
      setSelectedHotelId,
      role,
      roleLabel: ROLE_LABELS[role] ?? "No role",
      permissions,
      can: (permission) => permissions.includes(permission),
      isLegacyMode: Boolean(hotel?.isLegacy),
    };
  }, [effectiveHotelId, hotel, hotels]);

  if (isLoading) return <Spinner />;

  return (
    <HotelContext.Provider value={value}>{children}</HotelContext.Provider>
  );
}

function useHotel() {
  const context = useContext(HotelContext);
  if (!context)
    throw new Error("useHotel must be used inside a HotelProvider");
  return context;
}

export { HotelProvider, useHotel };
