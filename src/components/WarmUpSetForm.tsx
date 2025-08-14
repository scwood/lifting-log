import { v4 as uuidV4 } from "uuid";
import { Flex, Radio } from "@mantine/core";
import z from "zod";

import { WarmUpType } from "../types/WarmUpType";
import { WarmUpSet } from "../types/WarmUpSet";
import { useAppForm } from "../hooks/useAppForm";

export interface WarmUpSetFormProps {
  defaultValues?: WarmUpSet;
  onSave: (warmUpSet: WarmUpSet) => void;
}

const formSchema = z.object({
  type: z.enum(WarmUpType),
  reps: z.number("Reps is required").gt(0, "Reps must be greater than 0"),
  value: z
    .number("Value is required")
    .gte(0, "Value must be greater than or equal to 0"),
});

export function WarmUpSetForm(props: WarmUpSetFormProps) {
  const { defaultValues, onSave } = props;

  const form = useAppForm({
    defaultValues: {
      type: defaultValues?.type ?? WarmUpType.Percentage,
      reps: defaultValues?.reps ?? 0,
      value: defaultValues?.value ?? 0,
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: ({ value }) => {
      if (defaultValues) {
        onSave({
          ...defaultValues,
          ...value,
        });
      } else {
        onSave({
          id: uuidV4(),
          ...value,
        });
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Flex direction="column" gap="sm">
        <form.AppField
          name="type"
          children={(field) => {
            return (
              <field.AppRadioGroup
                withAsterisk
                label="Type"
                description="Warm-up sets can be a fixed weight (e.g. 45 lbs) or a percentage of the working weight (e.g. 60%)."
              >
                <Flex direction="column" gap="xs" mt="xs">
                  <Radio
                    value={WarmUpType.Percentage}
                    label="Percentage of working weight"
                  />
                  <Radio value={WarmUpType.Weight} label="Fixed weight" />
                </Flex>
              </field.AppRadioGroup>
            );
          }}
        />
        <form.Subscribe
          selector={(state) => state.values.type}
          children={(warmUpType) => {
            return (
              <>
                <form.AppField
                  name="reps"
                  children={(field) => {
                    return (
                      <field.AppNumberInput
                        withAsterisk
                        allowDecimal={false}
                        allowNegative={false}
                        label="Reps"
                        description="Number of reps for the set"
                      />
                    );
                  }}
                />
                <form.AppField
                  name="value"
                  children={(field) => {
                    return (
                      <field.AppNumberInput
                        withAsterisk
                        allowDecimal={false}
                        allowNegative={false}
                        max={
                          warmUpType === WarmUpType.Percentage ? 100 : undefined
                        }
                        description={
                          warmUpType === WarmUpType.Percentage
                            ? "Percentage of working weight (1-100)"
                            : "Weight for the set"
                        }
                        label={
                          warmUpType === WarmUpType.Percentage
                            ? "Percentage"
                            : "Weight"
                        }
                      />
                    );
                  }}
                />
              </>
            );
          }}
        />
      </Flex>
      <form.AppForm>
        <Flex justify="flex-end" mt="lg">
          <form.AppSubmitButton />
        </Flex>
      </form.AppForm>
    </form>
  );
}
