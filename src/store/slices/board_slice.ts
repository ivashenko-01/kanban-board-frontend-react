import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ID, T_Column, T_Task } from "../../types";

import { get_list_column__Thunk } from "./board_thunk";
import { get_list_task__Thunk } from "./board_thunk";
import { arrayMove } from "@dnd-kit/sortable";

interface I_BOARD_STATE {
  is_loading: boolean;
  error: string | null;
  columns: T_Column[];
  tasks: T_Task[];
}

const initialState: I_BOARD_STATE = {
  is_loading: false,
  error: null,
  columns: [],
  tasks: [],
};

const board_slice = createSlice({
  name: "board",
  initialState,
  reducers: {
    add_column: (state, action: PayloadAction<T_Column>) => {
      state.columns.push(action.payload);
    },
    update_column: (
      state,
      action: PayloadAction<{ id: ID; changes: Partial<T_Column> }> // Обновляем тип
    ) => {
      const index = state.columns.findIndex(
        (column) => column.id === action.payload.id
      );
      if (index !== -1) {
        state.columns[index] = {
          ...state.columns[index],
          ...action.payload.changes,
        };
      }
    },
    set_columns: (state, action: PayloadAction<T_Column[]>) => {
      state.columns = action.payload;
    },
    move_column: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      const { fromIndex, toIndex } = action.payload;
      state.columns = arrayMove(state.columns, fromIndex, toIndex);
    },
    delete_column: (state, action: PayloadAction<ID>) => {
      state.columns = state.columns.filter(
        (column) => column.id !== action.payload
      );
      state.tasks = state.tasks.filter(
        (task) => task.column_id !== action.payload
      );
    },
    add_task: (state, action: PayloadAction<T_Task>) => {
      state.tasks.push(action.payload);
    },
    update_task: (
      state,
      action: PayloadAction<{ id: ID; changes: Partial<T_Task> }> // Обновляем тип!
    ) => {
      const index = state.tasks.findIndex(
        (task) => task.id === action.payload.id
      );
      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          ...action.payload.changes,
        };
      }
    },
    set_tasks: (state, action: PayloadAction<T_Task[]>) => {
      state.tasks = action.payload;
    },
    move_task: (
      state,
      action: PayloadAction<{ taskId: ID; newIndex: number; columnId: ID }>
    ) => {
      const { taskId, newIndex, columnId } = action.payload;

      // Находим задачу
      const taskIndex = state.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return;

      // Обновляем колонку если нужно
      if (state.tasks[taskIndex].column_id !== columnId) {
        state.tasks[taskIndex].column_id = columnId;
      }

      // Получаем задачи в целевой колонке
      const tasksInColumn = state.tasks.filter((t) => t.column_id === columnId);

      // Удаляем задачу из текущей позиции
      const [movedTask] = state.tasks.splice(taskIndex, 1);

      // Вставляем в новую позицию
      const insertIndex =
        newIndex >= tasksInColumn.length ? tasksInColumn.length : newIndex;
      state.tasks.splice(insertIndex, 0, movedTask);
    },
    delete_task: (state, action: PayloadAction<ID>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // --- Получение списка колонок  ---
    builder.addCase(get_list_column__Thunk.pending, (state) => {
      state.is_loading = true;
      state.error = null;
    });
    builder.addCase(get_list_column__Thunk.fulfilled, (state, action) => {
      state.is_loading = false;
      if (action.payload) {
        state.columns = action.payload;
      }
    });
    builder.addCase(get_list_column__Thunk.rejected, (state, action) => {
      state.is_loading = false;
      state.error =
        action.error.message || "Ошибка при получении списка колонок.";
    });
    // --- Получение списка задач  ---
    builder.addCase(get_list_task__Thunk.pending, (state) => {
      state.is_loading = true;
      state.error = null;
    });
    builder.addCase(get_list_task__Thunk.fulfilled, (state, action) => {
      state.is_loading = false;
      if (action.payload) {
        state.tasks = action.payload;
      }
    });
    builder.addCase(get_list_task__Thunk.rejected, (state, action) => {
      state.is_loading = false;
      state.error =
        action.error.message || "Ошибка при получении списка задач.";
    });
  },
});

export const {
  add_column,
  update_column,
  set_columns,
  move_column,
  delete_column,
} = board_slice.actions;

export const { add_task, update_task, set_tasks, move_task, delete_task } =
  board_slice.actions;

export default board_slice.reducer;
