import Heading from "../ui/Heading";
import Row from "../ui/Row";
import BookingTable from "../features/bookings/BookingTable";
import BookingTableOperations from "../features/bookings/BookingTableOperations";
import AddBooking from "../features/bookings/AddBooking";
import Can from "../ui/Can";
import { PERMISSIONS } from "../features/hotels/permissions";
import styled from "styled-components";

const Operations = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

function Bookings() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">All bookings</Heading>
        <Operations>
          <BookingTableOperations />
          <Can permission={PERMISSIONS.BOOKINGS_CREATE}>
            <AddBooking />
          </Can>
        </Operations>
      </Row>

      <BookingTable />
    </>
  );
}

export default Bookings;
