import styled from "styled-components";
import { useHotel } from "../../context/HotelContext";
import Select from "../../ui/Select";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-right: auto;
`;

const Label = styled.span`
  color: var(--color-grey-500);
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const Role = styled.span`
  color: var(--color-brand-700);
  background-color: var(--color-brand-50);
  border-radius: 100px;
  padding: 0.4rem 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
`;

function HotelSelect() {
  const { hotels, selectedHotelId, setSelectedHotelId, roleLabel } = useHotel();

  return (
    <Wrapper>
      <Label>Hotel</Label>
      <Select
        type="white"
        aria-label="Select hotel"
        value={selectedHotelId ?? ""}
        onChange={(event) => setSelectedHotelId(event.target.value)}
        options={hotels.map((hotel) => ({
          value: String(hotel.id),
          label: hotel.name,
        }))}
      />
      <Role>{roleLabel}</Role>
    </Wrapper>
  );
}

export default HotelSelect;
