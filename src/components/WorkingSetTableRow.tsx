import { Checkbox, NumberInput, Table, Tooltip } from "@mantine/core";

import { calculatePlates } from "../utils/workoutUtils";
import { WorkingSet } from "../types/WorkingSet";
import { Exercise } from "../types/Exercise";

export interface WorkingSetTableRowProps {
  exercise: Exercise;
  workingSet: WorkingSet;
  onChange: (workingSet: WorkingSet) => void;
}

export function WorkingSetTableRow(props: WorkingSetTableRowProps) {
  const { exercise, workingSet, onChange } = props;

  return (
    <Table.Tr>
      <Table.Td>{exercise.weight}</Table.Td>
      <Table.Td>{calculatePlates(exercise.weight)}</Table.Td>
      <Table.Td>
        <NumberInput
          styles={{ input: { width: 42 } }}
          allowDecimal={false}
          max={99}
          min={0}
          placeholder={String(exercise.reps)}
          value={workingSet.reps ?? ""}
          onChange={handleOnChangeReps}
          hideControls
        />
      </Table.Td>
      <Table.Td>
        <Tooltip
          label="Enter reps to log"
          withArrow
          disabled={workingSet.reps !== null}
          events={{ hover: true, touch: true, focus: false }}
        >
          <Checkbox
            size="md"
            color="green"
            onChange={handleOnChangeIsLogged}
            disabled={workingSet.reps === null}
            checked={workingSet.isLogged}
          />
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  );

  function handleOnChangeReps(value: string | number) {
    const parsedValue = parseInt(String(value));
    onChange({
      isLogged: parsedValue >= 0 ? workingSet.isLogged : false,
      reps: parsedValue >= 0 ? parsedValue : null,
    });
  }

  function handleOnChangeIsLogged(event: React.ChangeEvent<HTMLInputElement>) {
    onChange({
      isLogged: event.target.checked,
      reps: workingSet.reps,
    });
  }
}
