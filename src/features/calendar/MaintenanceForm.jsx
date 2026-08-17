import { addDays, differenceInCalendarDays, format } from "date-fns";
import { useForm } from "react-hook-form";
import Button from "../../ui/Button";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import Textarea from "../../ui/Textarea";
import { useCabins } from "../cabins/useCabins";
import { useCreateMaintenanceBlock } from "./useCreateMaintenanceBlock";

function MaintenanceForm({ onCloseModal }) {
  const { cabins = [] } = useCabins();
  const { createMaintenanceBlock, isCreating } = useCreateMaintenanceBlock();
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { startDate: today, endDate: tomorrow },
  });

  function onSubmit(data) {
    createMaintenanceBlock(data, { onSuccess: () => onCloseModal?.() });
  }

  return (
    <Form type="modal" onSubmit={handleSubmit(onSubmit)}>
      <FormRow label="Cabin" error={errors?.cabinId?.message}>
        <Select
          id="cabinId"
          disabled={isCreating}
          {...register("cabinId", { required: "Select a cabin" })}
          options={[
            { value: "", label: "Select a cabin" },
            ...cabins.map((cabin) => ({
              value: String(cabin.id),
              label: `Cabin ${cabin.name}`,
            })),
          ]}
        />
      </FormRow>
      <FormRow label="Start date" error={errors?.startDate?.message}>
        <Input
          id="startDate"
          type="date"
          min={today}
          disabled={isCreating}
          {...register("startDate", { required: "This field is required" })}
        />
      </FormRow>
      <FormRow label="End date" error={errors?.endDate?.message}>
        <Input
          id="endDate"
          type="date"
          disabled={isCreating}
          {...register("endDate", {
            required: "This field is required",
            validate: (value) =>
              differenceInCalendarDays(
                new Date(value),
                new Date(watch("startDate")),
              ) > 0 || "End date must be after start date",
          })}
        />
      </FormRow>
      <FormRow label="Reason" error={errors?.reason?.message}>
        <Textarea
          id="reason"
          disabled={isCreating}
          {...register("reason", { required: "This field is required" })}
        />
      </FormRow>
      <FormRow>
        <Button
          type="button"
          variation="secondary"
          onClick={() => onCloseModal?.()}
        >
          Cancel
        </Button>
        <Button disabled={isCreating}>Block cabin</Button>
      </FormRow>
    </Form>
  );
}

export default MaintenanceForm;
