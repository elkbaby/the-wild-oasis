import Table from "../../ui/Table";
import Select from "../../ui/Select";
import Spinner from "../../ui/Spinner";
import Empty from "../../ui/Empty";
import { ROLE_LABELS } from "../hotels/permissions";
import { useUser } from "../authentication/useUser";
import { useHotelMembers, useUpdateHotelMember } from "./useHotelMembers";

function MemberTable() {
  const { user } = useUser();
  const { members, isLoading } = useHotelMembers();
  const { updateRole, isUpdating } = useUpdateHotelMember();

  if (isLoading) return <Spinner />;
  if (!members.length) return <Empty resourceName="team members" />;

  return (
    <Table columns="1.5fr 2fr 1fr 1.2fr">
      <Table.Header>
        <div>Name</div>
        <div>Email</div>
        <div>User ID</div>
        <div>Role</div>
      </Table.Header>
      <Table.Body
        data={members}
        render={(member) => (
          <Table.Row key={member.id}>
            <span>{member.profiles?.fullName ?? "Pending profile"}</span>
            <span>{member.profiles?.email ?? "—"}</span>
            <span>{member.userId.slice(0, 8)}…</span>
            <Select
              aria-label={`Role for ${member.profiles?.fullName ?? member.userId}`}
              value={member.role}
              disabled={isUpdating || member.userId === user.id}
              onChange={(event) =>
                updateRole({ memberId: member.id, role: event.target.value })
              }
              options={Object.entries(ROLE_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Table.Row>
        )}
      />
    </Table>
  );
}

export default MemberTable;
