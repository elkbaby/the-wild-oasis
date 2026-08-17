import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import BookingForm from "./BookingForm";

function AddBooking() {
  return (
    <Modal>
      <Modal.Open opens="booking-form">
        <Button>New booking</Button>
      </Modal.Open>
      <Modal.Window name="booking-form">
        <BookingForm />
      </Modal.Window>
    </Modal>
  );
}

export default AddBooking;
