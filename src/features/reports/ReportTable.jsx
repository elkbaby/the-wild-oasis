import { format } from "date-fns";
import Table from "../../ui/Table";
import Tag from "../../ui/Tag";
import { formatCurrency } from "../../utils/helpers";

const statusColors = {
  unconfirmed: "blue",
  "checked-in": "green",
  "checked-out": "silver",
  cancelled: "red",
};

function ReportTable({ bookings }) {
  return (
    <Table columns="0.7fr 1.2fr 1.8fr 1.8fr 1.2fr 1fr">
      <Table.Header>
        <div>ID</div>
        <div>Cabin</div>
        <div>Guest</div>
        <div>Stay</div>
        <div>Status</div>
        <div>Revenue</div>
      </Table.Header>
      <Table.Body
        data={bookings}
        render={(booking) => (
          <Table.Row key={booking.id}>
            <span>#{booking.id}</span>
            <span>Cabin {booking.cabins?.name}</span>
            <span>{booking.guests?.fullName}</span>
            <span>
              {format(new Date(booking.startDate), "MMM d")} – {format(new Date(booking.endDate), "MMM d, yyyy")}
            </span>
            <Tag type={statusColors[booking.status] ?? "silver"}>
              {booking.status.replace("-", " ")}
            </Tag>
            <span>{formatCurrency(booking.totalPrice)}</span>
          </Table.Row>
        )}
      />
    </Table>
  );
}

export default ReportTable;
