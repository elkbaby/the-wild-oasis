import styled from "styled-components";
import { useHotel } from "../context/HotelContext";
import Heading from "./Heading";

const Box = styled.div`
  padding: 4.8rem;
  text-align: center;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
`;

const Text = styled.p`
  margin-top: 1.2rem;
  color: var(--color-grey-500);
  font-size: 1.6rem;
`;

function PermissionRoute({ permission, children }) {
  const { can } = useHotel();

  if (can(permission)) return children;

  return (
    <Box>
      <Heading as="h2">Access restricted</Heading>
      <Text>Your current hotel role does not include this permission.</Text>
    </Box>
  );
}

export default PermissionRoute;
