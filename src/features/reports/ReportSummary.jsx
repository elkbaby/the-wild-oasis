import styled from "styled-components";
import { formatCurrency } from "../../utils/helpers";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2.4rem;
`;

const Card = styled.div`
  padding: 2rem 2.4rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
`;

const Label = styled.p`
  color: var(--color-grey-500);
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const Value = styled.p`
  margin-top: 0.6rem;
  color: var(--color-grey-700);
  font-family: "Sono";
  font-size: 2.4rem;
  font-weight: 500;
`;

function ReportSummary({ bookings }) {
  const revenue = bookings.reduce(
    (sum, booking) => sum + Number(booking.totalPrice ?? 0),
    0,
  );
  const paidRevenue = bookings
    .filter((booking) => booking.isPaid)
    .reduce((sum, booking) => sum + Number(booking.totalPrice ?? 0), 0);
  const nights = bookings.reduce(
    (sum, booking) => sum + Number(booking.numNights ?? 0),
    0,
  );

  return (
    <Grid>
      <Card><Label>Bookings</Label><Value>{bookings.length}</Value></Card>
      <Card><Label>Room nights</Label><Value>{nights}</Value></Card>
      <Card><Label>Total revenue</Label><Value>{formatCurrency(revenue)}</Value></Card>
      <Card><Label>Paid revenue</Label><Value>{formatCurrency(paidRevenue)}</Value></Card>
    </Grid>
  );
}

export default ReportSummary;
