import { Checkbox, NumberInput, Table, Tooltip } from "@mantine/core";
import { useState } from "react";

import { Exercise } from "../types/Exercise";
import { WorkingSet } from "../types/WorkingSet";
import { calculatePlates } from "../utils/weightUtils";
import { selectExerciseUsesPlates } from "../utils/workoutSelectors";

export interface WorkingSetTableRowProps {
  exercise: Exercise;
  setNumber: number;
  workingSet: WorkingSet;
  onChange: (workingSet: WorkingSet) => void;
}

export function WorkingSetTableRow(props: WorkingSetTableRowProps) {
  const { exercise, setNumber, workingSet, onChange } = props;
  const [localReps, setLocalReps] = useState(workingSet.reps ?? exercise.reps);
  const isLocalRepsValid = localReps >= 0;

  return (
    <Table.Tr>
      <Table.Td>{exercise.weight}</Table.Td>
      {selectExerciseUsesPlates(exercise) && (
        <Table.Td>{calculatePlates(exercise.weight, exercise.type)}</Table.Td>
      )}
      <Table.Td>
        <NumberInput
          inputMode="numeric"
          styles={{ input: { width: 42 } }}
          allowDecimal={false}
          max={99}
          min={0}
          placeholder={String(exercise.reps)}
          aria-label={`Reps for set ${setNumber}`}
          value={localReps}
          onChange={handleOnChangeReps}
          onFocus={handleOnFocusReps}
          hideControls
        />
      </Table.Td>
      <Table.Td>
        <Tooltip
          label="Enter reps to log"
          withArrow
          disabled={isLocalRepsValid}
          events={{ hover: true, touch: true, focus: false }}
        >
          <Checkbox
            size="md"
            color="green"
            onChange={handleOnChangeIsLogged}
            disabled={!isLocalRepsValid}
            checked={workingSet.isLogged}
          />
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  );

  function handleOnChangeReps(value: string | number) {
    const parsedValue = parseInt(String(value));
    const isValid = parsedValue >= 0;
    setLocalReps(parsedValue);
    onChange({
      isLogged: isValid ? workingSet.isLogged : false,
      reps: isValid ? parsedValue : null,
    });
  }

  function handleOnChangeIsLogged(event: React.ChangeEvent<HTMLInputElement>) {
    onChange({
      isLogged: event.target.checked,
      reps: localReps,
    });
  }

  function handleOnFocusReps(event: React.FocusEvent<HTMLInputElement>) {
    event.currentTarget.select();
  }
}
