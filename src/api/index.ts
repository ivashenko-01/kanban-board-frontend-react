// import axios from '';

// const BASE_URL = '/v100/tasks';

// --- Получение списка задач  ---
import list_task from "./list-task.json";

export const get_list_task = () => {
  return list_task;
};

// --- Получение списка колонок  ---
import list_column from "./list-column.json";

export const get_list_column = () => {
  return list_column;
};

// type get_list_task_PROPS = {
//   board_id: string;
// };

// export const get_list_task = (props: get_list_task_PROPS) => {
//   const { board_id } = props;
//   return axios
//     .delete(`${BASE_URL}/${board_id}`, { data: { executor_id } })
//     .catch((error) => {
//       return error;
//     });
// };
