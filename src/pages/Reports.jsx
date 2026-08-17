import { format, subDays } from "date-fns";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { useReportBookings } from "../features/reports/useReportBookings";
import ReportSummary from "../features/reports/ReportSummary";
import ReportTable from "../features/reports/ReportTable";
import { PERMISSIONS } from "../features/hotels/permissions";
import Button from "../ui/Button";
import Can from "../ui/Can";
import Heading from "../ui/Heading";
import Input from "../ui/Input";
import Row from "../ui/Row";
import Select from "../ui/Select";
import Spinner from "../ui/Spinner";
import { downloadBookingsCsv } from "../utils/exportCsv";

const Filters = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.2rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
`;

const Label = styled.label`
  color: var(--color-grey-500);
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
`;

function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = {
    from:
      searchParams.get("from") ?? format(subDays(new Date(), 30), "yyyy-MM-dd"),
    to: searchParams.get("to") ?? format(new Date(), "yyyy-MM-dd"),
    status: searchParams.get("status") ?? "all",
  };
  const { bookings, isLoading } = useReportBookings(filters);

  function updateFilter(field, value) {
    searchParams.set(field, value);
    setSearchParams(searchParams);
  }

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Reports</Heading>
        <Filters>
          <Label htmlFor="report-from">From</Label>
          <Input
            id="report-from"
            type="date"
            value={filters.from}
            onChange={(event) => updateFilter("from", event.target.value)}
          />
          <Label htmlFor="report-to">To</Label>
          <Input
            id="report-to"
            type="date"
            value={filters.to}
            onChange={(event) => updateFilter("to", event.target.value)}
          />
          <Select
            aria-label="Booking status"
            type="white"
            value={filters.status}
            onChange={(event) => updateFilter("status", event.target.value)}
            options={[
              { value: "all", label: "All statuses" },
              { value: "unconfirmed", label: "Unconfirmed" },
              { value: "checked-in", label: "Checked in" },
              { value: "checked-out", label: "Checked out" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
          <Can permission={PERMISSIONS.REPORTS_EXPORT}>
            <Button
              onClick={() =>
                downloadBookingsCsv(
                  bookings,
                  `bookings-${filters.from}-${filters.to}.csv`,
                )
              }
              disabled={!bookings.length}
            >
              Export CSV
            </Button>
          </Can>
        </Filters>
      </Row>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <ReportSummary bookings={bookings} />
          <ReportTable bookings={bookings} />
        </>
      )}
    </>
  );
}

export default Reports;
