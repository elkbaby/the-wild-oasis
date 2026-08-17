import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isSameDay,
} from "date-fns";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import Spinner from "../../ui/Spinner";
import Empty from "../../ui/Empty";
import { useCalendarData } from "./useCalendarData";
import { useRescheduleBooking } from "../bookings/useRescheduleBooking";
import { useHotel } from "../../context/HotelContext";
import { PERMISSIONS } from "../hotels/permissions";

const CalendarShell = styled.div`
  overflow-x: auto;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
`;

const Grid = styled.div`
  min-width: 112rem;
`;

const gridColumns = css`
  display: grid;
  grid-template-columns: 14rem repeat(14, minmax(7rem, 1fr));
`;

const Header = styled.div`
  ${gridColumns}
  background-color: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-200);
`;

const Corner = styled.div`
  padding: 1.6rem;
  color: var(--color-grey-600);
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const DateHeader = styled.div`
  padding: 1.2rem 0.4rem;
  text-align: center;
  color: ${(props) =>
    props.$today ? "var(--color-brand-700)" : "var(--color-grey-500)"};
  background-color: ${(props) =>
    props.$today ? "var(--color-brand-50)" : "transparent"};
  border-left: 1px solid var(--color-grey-100);
  font-size: 1.2rem;
  font-weight: 600;

  span {
    display: block;
    margin-top: 0.2rem;
    font-size: 1.4rem;
  }
`;

const CabinRow = styled.div`
  ${gridColumns}
  position: relative;
  min-height: 6.4rem;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }
`;

const CabinName = styled.div`
  grid-column: 1;
  grid-row: 1;
  z-index: 2;
  display: flex;
  align-items: center;
  padding: 1.2rem 1.6rem;
  background-color: var(--color-grey-0);
  color: var(--color-grey-700);
  font-family: "Sono";
  font-size: 1.5rem;
  font-weight: 600;
`;

const DayCell = styled.div`
  grid-row: 1;
  min-height: 6.4rem;
  border-left: 1px solid var(--color-grey-100);
  background-color: ${(props) =>
    props.$today ? "var(--color-brand-50)" : "transparent"};

  &:hover {
    background-color: var(--color-grey-50);
  }
`;

const statusStyles = {
  unconfirmed: css`
    color: var(--color-blue-700);
    background-color: var(--color-blue-100);
  `,
  "checked-in": css`
    color: var(--color-green-700);
    background-color: var(--color-green-100);
  `,
  "checked-out": css`
    color: var(--color-silver-700);
    background-color: var(--color-silver-100);
  `,
};

const Event = styled.button`
  grid-row: 1;
  z-index: 3;
  align-self: center;
  min-width: 0;
  margin: 0 0.4rem;
  padding: 0.8rem 1rem;
  overflow: hidden;
  border: none;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: ${(props) => (props.draggable ? "grab" : "pointer")};
  ${(props) => statusStyles[props.$status] ?? statusStyles.unconfirmed}

  &:active {
    cursor: grabbing;
  }
`;

const Maintenance = styled.div`
  grid-row: 1;
  z-index: 2;
  align-self: end;
  margin: 0 0.4rem 0.4rem;
  padding: 0.3rem 0.8rem;
  overflow: hidden;
  color: var(--color-red-700);
  background-color: var(--color-red-100);
  border-radius: var(--border-radius-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1.1rem;
  font-weight: 600;
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.6rem;
  padding: 1.2rem 1.6rem;
  border-top: 1px solid var(--color-grey-100);
  color: var(--color-grey-500);
  font-size: 1.2rem;
`;

const Dot = styled.span`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin-right: 0.6rem;
  background-color: var(--color-${(props) => props.$color}-100);
  border-radius: 50%;
`;

function getGridRange(item, rangeStart, numberOfDays) {
  const start = Math.max(
    0,
    differenceInCalendarDays(new Date(item.startDate), rangeStart),
  );
  const end = Math.min(
    numberOfDays,
    differenceInCalendarDays(new Date(item.endDate), rangeStart),
  );

  if (end <= 0 || start >= numberOfDays || start >= end) return null;
  return `${start + 2} / ${end + 2}`;
}

function RoomCalendar({ startDate }) {
  const navigate = useNavigate();
  const endDate = addDays(startDate, 14);
  const days = eachDayOfInterval({
    start: startDate,
    end: addDays(endDate, -1),
  });
  const { data, isLoading } = useCalendarData(startDate, endDate);
  const { rescheduleBooking, isRescheduling } = useRescheduleBooking();
  const { can } = useHotel();
  const canReschedule = can(PERMISSIONS.BOOKINGS_UPDATE);

  if (isLoading) return <Spinner />;
  if (!data?.cabins?.length) return <Empty resourceName="cabins" />;

  function handleDrop(event, cabinId, date) {
    event.preventDefault();
    if (!canReschedule || isRescheduling) return;

    const booking = JSON.parse(event.dataTransfer.getData("booking"));
    const duration = differenceInCalendarDays(
      new Date(booking.endDate),
      new Date(booking.startDate),
    );

    rescheduleBooking({
      bookingId: booking.id,
      cabinId,
      startDate: format(date, "yyyy-MM-dd"),
      endDate: format(addDays(date, duration), "yyyy-MM-dd"),
    });
  }

  return (
    <CalendarShell>
      <Grid>
        <Header>
          <Corner>Cabin</Corner>
          {days.map((day) => (
            <DateHeader key={day.toISOString()} $today={isSameDay(day, new Date())}>
              {format(day, "EEE")}
              <span>{format(day, "MMM d")}</span>
            </DateHeader>
          ))}
        </Header>

        {data.cabins.map((cabin) => {
          const bookings = data.bookings.filter(
            (booking) => String(booking.cabinId) === String(cabin.id),
          );
          const maintenanceBlocks = data.maintenanceBlocks.filter(
            (block) => String(block.cabinId) === String(cabin.id),
          );

          return (
            <CabinRow key={cabin.id}>
              <CabinName>Cabin {cabin.name}</CabinName>
              {days.map((day, index) => (
                <DayCell
                  key={day.toISOString()}
                  style={{ gridColumn: index + 2 }}
                  $today={isSameDay(day, new Date())}
                  onDragOver={(event) => canReschedule && event.preventDefault()}
                  onDrop={(event) => handleDrop(event, cabin.id, day)}
                />
              ))}

              {bookings.map((booking) => {
                const gridColumn = getGridRange(
                  booking,
                  startDate,
                  days.length,
                );
                if (!gridColumn) return null;

                return (
                  <Event
                    key={booking.id}
                    type="button"
                    style={{ gridColumn }}
                    $status={booking.status}
                    draggable={canReschedule && booking.status !== "checked-out"}
                    onDragStart={(event) =>
                      event.dataTransfer.setData(
                        "booking",
                        JSON.stringify(booking),
                      )
                    }
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                    title={`${booking.guests?.fullName} · ${booking.status}`}
                  >
                    {booking.guests?.fullName} · {booking.status.replace("-", " ")}
                  </Event>
                );
              })}

              {maintenanceBlocks.map((block) => {
                const gridColumn = getGridRange(
                  block,
                  startDate,
                  days.length,
                );
                if (!gridColumn) return null;
                return (
                  <Maintenance
                    key={block.id}
                    style={{ gridColumn }}
                    title={block.reason}
                  >
                    Maintenance · {block.reason}
                  </Maintenance>
                );
              })}
            </CabinRow>
          );
        })}
      </Grid>
      <Legend>
        <span><Dot $color="blue" />Unconfirmed</span>
        <span><Dot $color="green" />Checked in</span>
        <span><Dot $color="silver" />Checked out</span>
        <span><Dot $color="red" />Maintenance</span>
        {canReschedule && <span>Drag a stay to change its cabin or dates</span>}
      </Legend>
    </CalendarShell>
  );
}

export default RoomCalendar;
