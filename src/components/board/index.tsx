import { useEffect, useMemo } from "react";

import clsx from "clsx";
import styled from "./style.module.scss";

import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

import { useKanbanDnD } from "../../hooks/useKanbanDnD";
import { useColumn } from "../../hooks/useColumn";
import { useTask } from "../../hooks/useTask";

import { useAppDispatch } from "../../store";

import { get_list_task__Thunk } from "../../store/slices/board_thunk";
import { get_list_column__Thunk } from "../../store/slices/board_thunk";

import { Column } from "../column";
import { Task } from "../task";
import { add_column } from "../../store/slices/board_slice";
import { generate_id } from "../../utils/generate_id";

export function Board() {
  const { columns } = useColumn();

  const { tasks } = useTask();

  const {
    sensors,
    on_drag_start,
    on_drag_end,
    on_drag_over,
    active_column,
    active_task,
  } = useKanbanDnD(columns, tasks);

  const columns_id = useMemo(
    () => columns.map((column) => column.id),
    [columns]
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    async function f1() {
      dispatch(get_list_task__Thunk());
      dispatch(get_list_column__Thunk());
    }
    f1();
  }, [dispatch]);

  return (
    <>
      <div className={clsx(styled["board"])}>
        <div className={clsx(styled["header"])}>
          <div className={clsx(styled["header-button"])}>
            <button
              className={clsx(styled["button-add-column"])}
              onClick={() => {
                dispatch(
                  add_column({
                    id: generate_id(),
                    title: `Без названия`,
                  })
                );
              }}
            >
              Создать колонку
            </button>
          </div>
        </div>

        <div className={clsx(styled["board-columns"])}>
          <DndContext
            sensors={sensors}
            onDragStart={on_drag_start}
            onDragEnd={on_drag_end}
            onDragOver={on_drag_over}
          >
            <SortableContext items={columns_id}>
              <div className={clsx(styled["columns"])}>
                {columns.map((column) => (
                  <Column
                    key={column.id}
                    column={column}
                    tasks={tasks.filter((task) => task.column_id === column.id)}
                  />
                ))}
              </div>
            </SortableContext>
            {createPortal(
              <DragOverlay>
                {active_column && (
                  <Column
                    key={active_column.id}
                    column={active_column}
                    tasks={tasks.filter(
                      (task) => task.column_id === active_column.id
                    )}
                  />
                )}
                {active_task && <Task task={active_task}></Task>}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        </div>
      </div>
    </>
  );
}
