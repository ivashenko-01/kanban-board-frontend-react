export type ID = string | number;

export type T_Board = {
  id: ID;
  title: string;
};

// --- Добавить board_id
export type T_Column = {
  id: ID;
  title: string;
};

// --- Добавить board_id
export type T_Task = {
  id: ID;
  column_id: ID;
  title: string;
};
