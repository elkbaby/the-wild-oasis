import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import MaintenanceForm from "./MaintenanceForm";

function AddMaintenanceBlock() {
  return (
    <Modal>
      <Modal.Open opens="maintenance-form">
        <Button variation="secondary">Block for maintenance</Button>
      </Modal.Open>
      <Modal.Window name="maintenance-form">
        <MaintenanceForm />
      </Modal.Window>
    </Modal>
  );
}

export default AddMaintenanceBlock;
