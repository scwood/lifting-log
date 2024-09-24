import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Flex,
  NumberInput,
  Select,
  Modal,
  Divider,
  Button,
} from "@mantine/core";

import { WarmUpType } from "../types/WarmUpType";
import { WarmUpSet } from "../types/WarmUpSet";

export interface WarmUpSetModalProps {
  opened: boolean;
  warmUpSet?: WarmUpSet;
  onClose: () => void;
  onSave: (warmUpSet: WarmUpSet) => void;
}

const warmUpTypeSelect: { [warmUpType in WarmUpType]: string } = {
  [WarmUpType.Weight]: "Fixed weight",
  [WarmUpType.Percentage]: "Percentage of working weight",
};

export function WarmUpSetModal(props: WarmUpSetModalProps) {
  const { opened, warmUpSet, onClose, onSave } = props;
  const [reps, setReps] = useState<number | string>(warmUpSet?.reps ?? "");
  const [value, setValue] = useState<number | string>(warmUpSet?.value ?? "");
  const [warmUpType, setWarmUpType] = useState<WarmUpType>(
    warmUpSet?.type ?? WarmUpType.Percentage
  );

  const [prevOpened, setPrevOpened] = useState(opened);
  if (prevOpened !== opened) {
    setPrevOpened(opened);
    resetInputs();
  }

  const parsedNumbers = {
    reps: parseInt(String(reps)),
    value: parseInt(String(value)),
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      title={`${warmUpSet ? "Edit" : "Create"} warm-up set`}
    >
      <Flex direction="column" gap="sm">
        <Select
          value={warmUpTypeSelect[warmUpType]}
          allowDeselect={false}
          onChange={handleWarmUpTypeChange}
          label="Type"
          required
          description="Warm-up sets can be a fixed weight (e.g. 45 lbs) or a percentage of the working weight (e.g. 60%)."
          data={[
            warmUpTypeSelect[WarmUpType.Percentage],
            warmUpTypeSelect[WarmUpType.Weight],
          ]}
        />
        <NumberInput
          allowDecimal={false}
          allowNegative={false}
          label="Reps"
          description="Number of reps for the set"
          placeholder={warmUpType === WarmUpType.Percentage ? "5" : "10"}
          required
          value={reps}
          onChange={setReps}
        />
        <NumberInput
          allowDecimal={false}
          allowNegative={false}
          required
          max={warmUpType === WarmUpType.Percentage ? 100 : undefined}
          placeholder={warmUpType === WarmUpType.Percentage ? "60" : "45"}
          description={
            warmUpType === WarmUpType.Percentage
              ? "Percentage of working weight (1-100)"
              : "Weight in pounds"
          }
          label={warmUpType === WarmUpType.Percentage ? "Percentage" : "Weight"}
          value={value}
          onChange={setValue}
        />
        <Divider />
        <div>
          <Button color="green" onClick={handleSave} disabled={!isFormValid()}>
            Save
          </Button>
        </div>
      </Flex>
    </Modal>
  );

  function resetInputs() {
    setReps(warmUpSet?.reps ?? "");
    setValue(warmUpSet?.value ?? "");
    setWarmUpType(warmUpSet?.type ?? WarmUpType.Percentage);
  }

  function isFormValid() {
    return parsedNumbers.reps > 0 && parsedNumbers.value > 0;
  }

  function handleSave() {
    onClose();
    if (warmUpSet) {
      onSave({
        ...warmUpSet,
        type: warmUpType,
        reps: parsedNumbers.reps,
        value: parsedNumbers.value,
      });
    } else {
      onSave({
        id: uuidv4(),
        type: warmUpType,
        reps: parsedNumbers.reps,
        value: parsedNumbers.value,
      });
    }
  }

  function handleWarmUpTypeChange(value: string | null) {
    if (value === warmUpTypeSelect[WarmUpType.Weight]) {
      setWarmUpType(WarmUpType.Weight);
    } else {
      setWarmUpType(WarmUpType.Percentage);
    }
  }
}
