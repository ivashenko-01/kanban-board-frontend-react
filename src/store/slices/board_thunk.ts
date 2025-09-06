import { createAsyncThunk } from "@reduxjs/toolkit";

import { get_list_column } from "../../api";
import { get_list_task } from "../../api";

// --- Получение списка колонок  ---
export const get_list_column__Thunk = createAsyncThunk(
  "boards/get_list_column",
  async () => {
    const { data } = await get_list_column();
    if (data) {
      return data;
    }
  }
);

// --- Получение списка задач  ---
export const get_list_task__Thunk = createAsyncThunk(
  "boards/get_list_task",
  async () => {
    const { data } = await get_list_task();
    if (data) {
      return data;
    }
  }
);

// type get_list_task_PROPS = {
//   board_id: string;
// };

// export const get_list_task__Thunk = createAsyncThunk(
//   "boards/get_list_task",
//   async (props: get_list_task_PROPS, { rejectWithValue }) => {
//     const { data, response } = await get_list_task(props);

//     if (data) {
//       return data;
//     } else if (response) {
//       return rejectWithValue(response.data);
//     }
//   }
// );
