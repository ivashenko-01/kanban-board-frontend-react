import { useCallback, useState, useRef, useEffect } from "react";

import {
  useSensor,
  useSensors,
  PointerSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { arrayMove } from "@dnd-kit/sortable";

import type { T_Column, T_Task } from "../types";
import { useAppDispatch } from "../store";
import { set_columns, set_tasks } from "../store/slices/board_slice";

export const useKanbanDnD = (columns: T_Column[], tasks: T_Task[]) => {
  const dispatch = useAppDispatch();

  const [active_column, set_active_column] = useState<T_Column | null>(null);
  const [active_task, set_active_task] = useState<T_Task | null>(null);

  // Используем ref для хранения актуальных данных
  const columnsRef = useRef(columns);
  const tasksRef = useRef(tasks);

  // Синхронизируем ref с актуальными данными
  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const on_drag_start = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      set_active_column(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      set_active_task(event.active.data.current.task);
      return;
    }
  };

  const on_drag_end = useCallback(
    (event: DragEndEvent) => {
      set_active_column(null);
      set_active_task(null);

      const { active, over } = event;

      if (!over) return;

      const active_column_id = active.id;
      const over_column_id = over.id;

      if (active_column_id === over_column_id) return;

      // Используем актуальные данные из ref
      const currentColumns = columnsRef.current;
      // const currentTasks = tasksRef.current;

      // Обновляем колонки через Redux action
      const active_column_index = currentColumns.findIndex(
        (column) => column.id === active_column_id
      );
      const over_column_index = currentColumns.findIndex(
        (column) => column.id === over_column_id
      );

      if (active_column_index === -1 || over_column_index === -1) return;

      const newColumns = arrayMove(
        currentColumns,
        active_column_index,
        over_column_index
      );
      dispatch(set_columns(newColumns));
    },
    [dispatch]
  ); // Убрали зависимости columns

  const on_drag_over = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const active_task_id = active.id;
      const over_task_id = over.id;

      if (active_task_id === over_task_id) return;

      const is_active_task = active.data.current?.type === "Task";
      const is_over_task = over.data.current?.type === "Task";
      const is_over_column = over.data.current?.type === "Column";

      if (!is_active_task) return;

      // Используем актуальные данные из ref
      const currentTasks = tasksRef.current;

      // Случай 1: Перетаскиваем задачу над другой задачей
      if (is_active_task && is_over_task) {
        const activeIndex = currentTasks.findIndex(
          (t) => t.id === active_task_id
        );

        if (activeIndex === -1) return;

        const overIndex = currentTasks.findIndex((t) => t.id === over_task_id);

        if (activeIndex === -1 || overIndex === -1) return;

        const updatedTasks = [...currentTasks];
        updatedTasks[activeIndex] = {
          ...updatedTasks[activeIndex],
          column_id: updatedTasks[overIndex].column_id,
        };
        const newTasks = arrayMove(updatedTasks, activeIndex, overIndex);
        dispatch(set_tasks(newTasks));
      }

      // Случай 2: Перетаскиваем задачу над колонкой
      if (is_active_task && is_over_column) {
        const activeIndex = currentTasks.findIndex(
          (t) => t.id === active_task_id
        );

        if (activeIndex === -1) return;

        const updatedTasks = [...currentTasks];
        updatedTasks[activeIndex] = {
          ...updatedTasks[activeIndex],
          column_id: over_task_id,
        };
        dispatch(set_tasks(updatedTasks));
      }
    },
    [dispatch]
  ); // Убрали зависимости tasks

  return {
    sensors,
    on_drag_start,
    on_drag_end,
    on_drag_over,
    active_column,
    active_task,
  };
};
