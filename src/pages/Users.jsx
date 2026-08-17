import SignupForm from "../features/authentication/SignupForm";
import Heading from "../ui/Heading";
import MemberTable from "../features/users/MemberTable";
import Row from "../ui/Row";

function NewUsers() {
  return (
    <Row>
      <Heading as="h1">Manage team</Heading>
      <MemberTable />
      <Heading as="h2">Create a new user</Heading>
      <SignupForm />
    </Row>
  );
}

export default NewUsers;
