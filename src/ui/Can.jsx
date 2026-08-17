import { useHotel } from "../context/HotelContext";

function Can({ permission, children, fallback = null }) {
  const { can } = useHotel();
  return can(permission) ? children : fallback;
}

export default Can;
