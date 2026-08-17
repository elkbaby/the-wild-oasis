import { addDays, format, startOfDay } from "date-fns";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import AddMaintenanceBlock from "../features/calendar/AddMaintenanceBlock";
import RoomCalendar from "../features/calendar/RoomCalendar";
import AddBooking from "../features/bookings/AddBooking";
import { PERMISSIONS } from "../features/hotels/permissions";
import Button from "../ui/Button";
import Can from "../ui/Can";
import Heading from "../ui/Heading";
import Row from "../ui/Row";

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

function Calendar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStart = searchParams.get("start");
  const parsedStart = rawStart ? new Date(`${rawStart}T00:00:00`) : new Date();
  const startDate = Number.isNaN(parsedStart.getTime())
    ? startOfDay(new Date())
    : startOfDay(parsedStart);

  function moveRange(numberOfDays) {
    const next = addDays(startDate, numberOfDays);
    searchParams.set("start", format(next, "yyyy-MM-dd"));
    setSearchParams(searchParams);
  }

  function goToday() {
    searchParams.set("start", format(new Date(), "yyyy-MM-dd"));
    setSearchParams(searchParams);
  }

  return (
    <>
      <Row type="horizontal">
        <div>
          <Heading as="h1">Room calendar</Heading>
        </div>
        <Controls>
          <Button variation="secondary" onClick={() => moveRange(-14)}>
            Previous
          </Button>
          <Button variation="secondary" onClick={goToday}>
            Today
          </Button>
          <Button variation="secondary" onClick={() => moveRange(14)}>
            Next
          </Button>
          <Can permission={PERMISSIONS.BOOKINGS_CREATE}>
            <AddBooking />
          </Can>
          <Can permission={PERMISSIONS.MAINTENANCE_MANAGE}>
            <AddMaintenanceBlock />
          </Can>
        </Controls>
      </Row>

      <RoomCalendar startDate={startDate} />
    </>
  );
}

export default Calendar;
