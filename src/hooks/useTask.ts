import { useAppSelector } from "../store";

export const useTask = () => {
  const tasks = useAppSelector((state) => state.board.tasks);

  return {
    tasks,
  };
};
