import { format } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { useAuditLogs } from "../features/audit/useAuditLogs";
import Empty from "../ui/Empty";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
import Select from "../ui/Select";
import Spinner from "../ui/Spinner";
import Table from "../ui/Table";
import Tag from "../ui/Tag";

const actionColors = {
  INSERT: "green",
  UPDATE: "blue",
  DELETE: "red",
};

function Audit() {
  const [searchParams, setSearchParams] = useSearchParams();
  const action = searchParams.get("action") ?? "all";
  const { logs, isLoading } = useAuditLogs(action);

  function handleActionChange(event) {
    searchParams.set("action", event.target.value);
    setSearchParams(searchParams);
  }

  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">Audit log</Heading>
        <Select
          type="white"
          aria-label="Audit action"
          value={action}
          onChange={handleActionChange}
          options={[
            { value: "all", label: "All actions" },
            { value: "INSERT", label: "Created" },
            { value: "UPDATE", label: "Updated" },
            { value: "DELETE", label: "Deleted" },
          ]}
        />
      </Row>

      {isLoading ? (
        <Spinner />
      ) : !logs.length ? (
        <Empty resourceName="audit entries" />
      ) : (
        <Table columns="1.4fr 1fr 1.2fr 1.5fr 2fr">
          <Table.Header>
            <div>Time</div>
            <div>Action</div>
            <div>Resource</div>
            <div>User</div>
            <div>Record</div>
          </Table.Header>
          <Table.Body
            data={logs}
            render={(log) => (
              <Table.Row key={log.id}>
                <span>{format(new Date(log.created_at), "MMM d, yyyy HH:mm")}</span>
                <Tag type={actionColors[log.action] ?? "silver"}>{log.action}</Tag>
                <span>{log.resourceType}</span>
                <span>{log.profiles?.fullName ?? log.profiles?.email ?? "System"}</span>
                <span>#{log.resourceId}</span>
              </Table.Row>
            )}
          />
        </Table>
      )}
    </>
  );
}

export default Audit;
