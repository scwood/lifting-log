import { Button, Flex, Title } from "@mantine/core";
import { useState } from "react";
import { v4 as uuidV4 } from "uuid";

import { DayModal } from "./DayModal";
import { Day } from "../types/Day";
import { DayCard } from "./DayCard";
import { arraySwap } from "../utils/arraySwap";

export function Plan() {
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [days, setDays] = useState<Day[]>([]);
  const [dayToEdit, setDayToEdit] = useState<Day | null>(null);

  return (
    <>
      <Title mb="sm" order={3}>
        Workout plan
      </Title>
      <Flex direction="column" gap="sm">
        {days.map((day, index) => {
          return (
            <DayCard
              key={day.id}
              day={day}
              moveUpDisabled={index === 0}
              moveDownDisabled={index === days.length - 1}
              onEdit={handleEditDay}
              onDelete={handleDeleteDay}
              onMoveUp={handleMoveUpDay}
              onMoveDown={handleMoveDownDay}
            />
          );
        })}
      </Flex>
      <Button mt="md" onClick={handleCreateDay}>
        Create day
      </Button>
      <DayModal
        opened={isDayModalOpen}
        day={dayToEdit ?? undefined}
        onClose={handleDayModalClose}
        onSave={handleSaveDay}
      />
    </>
  );

  function handleSaveDay(name: string) {
    if (dayToEdit) {
      setDays((prev) => {
        return prev.map((day) => {
          return day.id === dayToEdit.id ? { ...day, name } : day;
        });
      });
    } else {
      setDays((prev) => {
        return [...prev, { id: uuidV4(), name, exercises: [] }];
      });
    }
  }

  function handleDeleteDay(day: Day) {
    setDays((prev) => {
      return prev.filter((d) => d.id !== day.id);
    });
  }

  function handleMoveUpDay(day: Day) {
    setDays((prev) => {
      const index = prev.findIndex((d) => d.id === day.id);
      if (index === 0 || index === -1) {
        return prev;
      }
      return arraySwap(prev, index, index - 1);
    });
  }

  function handleMoveDownDay(day: Day) {
    setDays((prev) => {
      const index = prev.findIndex((d) => d.id === day.id);
      if (index === prev.length - 1 || index === -1) {
        return prev;
      }
      return arraySwap(prev, index, index + 1);
    });
  }

  function handleDayModalClose() {
    setIsDayModalOpen(false);
  }

  function handleEditDay(day: Day) {
    setDayToEdit(day);
    setIsDayModalOpen(true);
  }

  function handleCreateDay() {
    setDayToEdit(null);
    setIsDayModalOpen(true);
  }
}
