import { v4 as uuidV4 } from "uuid";
import { Flex, NumberInput, Button, Radio } from "@mantine/core";
import { useForm } from "@mantine/form";

import { WarmUpType } from "../types/WarmUpType";
import { WarmUpSet } from "../types/WarmUpSet";
import { validateNumberNotEmpty } from "../utils/formUtils";

export interface WarmUpSetFormProps {
  initialValues?: WarmUpSet;
  onSave: (warmUpSet: WarmUpSet) => void;
}

export function WarmUpSetForm(props: WarmUpSetFormProps) {
  const { initialValues, onSave } = props;

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      type: initialValues?.type ?? WarmUpType.Percentage,
      reps: initialValues?.reps ?? 0,
      value: initialValues?.value ?? 0,
    },
    validate: {
      reps: validateNumberNotEmpty,
      value: validateNumberNotEmpty,
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    if (initialValues) {
      onSave({
        ...initialValues,
        ...values,
      });
    } else {
      onSave({
        id: uuidV4(),
        ...values,
      });
    }
  });

  const warmUpType = form.getValues().type;

  return (
    <form
      onSubmit={(event) => {
        event.stopPropagation();
        handleSubmit(event);
      }}
    >
      <Flex direction="column" gap="sm">
        <Radio.Group
          withAsterisk
          label="Type"
          description="Warm-up sets can be a fixed weight (e.g. 45 lbs) or a percentage of the working weight (e.g. 60%)."
          key={form.key("type")}
          {...form.getInputProps("type")}
        >
          <Flex direction="column" gap="xs" mt="xs">
            <Radio
              value={WarmUpType.Percentage}
              label="Percentage of working weight"
            />
            <Radio value={WarmUpType.Weight} label="Fixed weight" />
          </Flex>
        </Radio.Group>
        <NumberInput
          withAsterisk
          allowDecimal={false}
          allowNegative={false}
          label="Reps"
          description="Number of reps for the set"
          placeholder={warmUpType === WarmUpType.Percentage ? "5" : "10"}
          key={form.key("reps")}
          {...form.getInputProps("reps")}
        />
        <NumberInput
          withAsterisk
          allowDecimal={false}
          allowNegative={false}
          max={warmUpType === WarmUpType.Percentage ? 100 : undefined}
          placeholder={warmUpType === WarmUpType.Percentage ? "60" : "45"}
          description={
            warmUpType === WarmUpType.Percentage
              ? "Percentage of working weight (1-100)"
              : "Weight for the set"
          }
          label={warmUpType === WarmUpType.Percentage ? "Percentage" : "Weight"}
          key={form.key("value")}
          {...form.getInputProps("value")}
        />
      </Flex>
      <Flex justify="flex-end" mt="lg">
        <Button color="green" type="submit">
          Save
        </Button>
      </Flex>
    </form>
  );
}
