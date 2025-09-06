import { useAppSelector } from "../store";

export const useColumn = () => {
  const columns = useAppSelector((state) => state.board.columns);

  return {
    columns,
  };
};
