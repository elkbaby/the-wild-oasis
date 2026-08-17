import { useForm } from "react-hook-form";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import Textarea from "../../ui/Textarea";
import Checkbox from "../../ui/Checkbox";
import Button from "../../ui/Button";
import { useCabins } from "../cabins/useCabins";
import { useCreateBooking } from "./useCreateBooking";
import { useState } from "react";

function BookingForm({ onCloseModal }) {
  const { cabins = [] } = useCabins();
  const { createBooking, isCreating } = useCreateBooking();
  const [hasBreakfast, setHasBreakfast] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      startDate: today,
      endDate: tomorrow,
      numGuests: 1,
    },
  });

  const cabinId = watch("cabinId");
  const selectedCabin = cabins.find(
    (cabin) => String(cabin.id) === String(cabinId),
  );

  function onSubmit(data) {
    createBooking(
      { ...data, hasBreakfast, isPaid },
      { onSuccess: () => onCloseModal?.() },
    );
  }

  function validateEndDate(value) {
    return (
      differenceInCalendarDays(new Date(value), new Date(watch("startDate"))) >
        0 || "Check-out must be after check-in"
    );
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} type="modal">
      <FormRow label="Guest name" error={errors?.fullName?.message}>
        <Input
          id="fullName"
          disabled={isCreating}
          {...register("fullName", { required: "This field is required" })}
        />
      </FormRow>

      <FormRow label="Email address" error={errors?.email?.message}>
        <Input
          id="email"
          type="email"
          disabled={isCreating}
          {...register("email", {
            required: "This field is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Please provide a valid email address",
            },
          })}
        />
      </FormRow>

      <FormRow label="Nationality" error={errors?.nationality?.message}>
        <Input
          id="nationality"
          disabled={isCreating}
          {...register("nationality", { required: "This field is required" })}
        />
      </FormRow>

      <FormRow label="National ID" error={errors?.nationalID?.message}>
        <Input
          id="nationalID"
          disabled={isCreating}
          {...register("nationalID", { required: "This field is required" })}
        />
      </FormRow>

      <FormRow label="Cabin" error={errors?.cabinId?.message}>
        <Select
          id="cabinId"
          disabled={isCreating}
          {...register("cabinId", { required: "Select a cabin" })}
          options={[
            { value: "", label: "Select a cabin" },
            ...cabins.map((cabin) => ({
              value: String(cabin.id),
              label: `${cabin.name} · up to ${cabin.maxCapacity} guests`,
            })),
          ]}
        />
      </FormRow>

      <FormRow label="Check-in" error={errors?.startDate?.message}>
        <Input
          id="startDate"
          type="date"
          min={today}
          disabled={isCreating}
          {...register("startDate", { required: "This field is required" })}
        />
      </FormRow>

      <FormRow label="Check-out" error={errors?.endDate?.message}>
        <Input
          id="endDate"
          type="date"
          disabled={isCreating}
          {...register("endDate", {
            required: "This field is required",
            validate: validateEndDate,
          })}
        />
      </FormRow>

      <FormRow label="Number of guests" error={errors?.numGuests?.message}>
        <Input
          id="numGuests"
          type="number"
          min="1"
          max={selectedCabin?.maxCapacity}
          disabled={isCreating}
          {...register("numGuests", {
            required: "This field is required",
            min: { value: 1, message: "At least one guest is required" },
            max: {
              value: selectedCabin?.maxCapacity ?? 99,
              message: "This exceeds the cabin capacity",
            },
          })}
        />
      </FormRow>

      <FormRow label="Observations">
        <Textarea
          id="observations"
          disabled={isCreating}
          {...register("observations")}
        />
      </FormRow>

      <FormRow>
        <Checkbox
          id="hasBreakfast"
          checked={hasBreakfast}
          onChange={() => setHasBreakfast((value) => !value)}
          disabled={isCreating}
        >
          Include breakfast
        </Checkbox>
      </FormRow>

      <FormRow>
        <Checkbox
          id="isPaid"
          checked={isPaid}
          onChange={() => setIsPaid((value) => !value)}
          disabled={isCreating}
        >
          Payment has been received
        </Checkbox>
      </FormRow>

      <FormRow>
        <Button
          variation="secondary"
          type="button"
          onClick={() => onCloseModal?.()}
        >
          Cancel
        </Button>
        <Button disabled={isCreating}>Create booking</Button>
      </FormRow>
    </Form>
  );
}

export default BookingForm;
