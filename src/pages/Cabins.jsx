import CabinTable from "../features/cabins/CabinTable";
import Heading from "../ui/Heading";
import Row from "../ui/Row";
import AddCabin from "../features/cabins/AddCabin";
import CabinTableOperations from "../features/cabins/CabinTableOperations";
import Can from "../ui/Can";
import { PERMISSIONS } from "../features/hotels/permissions";

function Cabins() {
  return (
    <>
      <Row type="horizontal">
        <Heading as="h1">All cabins</Heading>
        <CabinTableOperations />
      </Row>

      <Row>
        <CabinTable />
        <Can permission={PERMISSIONS.CABINS_MANAGE}>
          <AddCabin />
        </Can>
      </Row>
    </>
  );
}

export default Cabins;
