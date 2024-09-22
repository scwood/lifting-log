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

import { WarmupType } from "../types/WarmupType";
import { WarmupSet } from "../types/WarmupSet";

export interface WarmupSetModalProps {
  opened: boolean;
  warmupSet?: WarmupSet;
  onClose: () => void;
  onSave: (warmupSet: WarmupSet) => void;
}

const warmupTypeSelect: { [warmupType in WarmupType]: string } = {
  [WarmupType.Weight]: "Fixed weight",
  [WarmupType.Percentage]: "Percentage of working weight",
};

export function WarmupSetModal(props: WarmupSetModalProps) {
  const { opened, warmupSet, onClose, onSave } = props;
  const [reps, setReps] = useState<number | string>(warmupSet?.reps ?? "");
  const [value, setValue] = useState<number | string>(warmupSet?.value ?? "");
  const [warmupType, setWarmupType] = useState<WarmupType>(
    warmupSet?.type ?? WarmupType.Percentage
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
      title={`${warmupSet ? "Edit" : "Create"} warmup set`}
    >
      <Flex direction="column" gap="sm">
        <Select
          value={warmupTypeSelect[warmupType]}
          allowDeselect={false}
          onChange={handleWarmupTypeChange}
          label="Type"
          required
          description="Warmup sets can be a fixed weight (e.g. 45 lbs) or a percentage of the working weight (e.g. 60%)."
          data={[
            warmupTypeSelect[WarmupType.Percentage],
            warmupTypeSelect[WarmupType.Weight],
          ]}
        />
        <NumberInput
          allowDecimal={false}
          allowNegative={false}
          label="Reps"
          description="Number of reps for the set"
          placeholder="5"
          required
          value={reps}
          onChange={setReps}
        />
        <NumberInput
          allowDecimal={false}
          allowNegative={false}
          required
          max={warmupType === WarmupType.Percentage ? 100 : undefined}
          placeholder={warmupType === WarmupType.Percentage ? "60" : "45"}
          description={
            warmupType === WarmupType.Percentage
              ? "Percentage of working weight (1-100)"
              : "Weight in pounds"
          }
          label={warmupType === WarmupType.Percentage ? "Percentage" : "Weight"}
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
    setReps(warmupSet?.reps ?? "");
    setValue(warmupSet?.value ?? "");
    setWarmupType(warmupSet?.type ?? WarmupType.Percentage);
  }

  function isFormValid() {
    return parsedNumbers.reps > 0 && parsedNumbers.value > 0;
  }

  function handleSave() {
    onClose();
    if (warmupSet) {
      onSave({
        ...warmupSet,
        type: warmupType,
        reps: parsedNumbers.reps,
        value: parsedNumbers.value,
      });
    } else {
      onSave({
        id: uuidv4(),
        type: warmupType,
        reps: parsedNumbers.reps,
        value: parsedNumbers.value,
      });
    }
  }

  function handleWarmupTypeChange(value: string | null) {
    if (value === warmupTypeSelect[WarmupType.Weight]) {
      setWarmupType(WarmupType.Weight);
    } else {
      setWarmupType(WarmupType.Percentage);
    }
  }
}
