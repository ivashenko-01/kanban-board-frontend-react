import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import clsx from "clsx";
import styled from "./style.module.scss";

import { Task } from "../task";
import type { ID, T_Column, T_Task } from "../../types";

import { RiMore2Fill, RiMenu5Fill } from "react-icons/ri";
import {
  RiSettings4Line,
  RiEdit2Line,
  RiFileCopyLine,
  RiFolderReduceLine,
  RiMagicLine,
  RiDeleteBin6Line,
} from "react-icons/ri";
import type { IconType } from "react-icons";

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Quick_Menu } from "../quick-menu";
import { useAppDispatch, type AppDispatch } from "../../store";
import { generate_id } from "../../utils/generate_id";
import {
  add_task,
  delete_column,
  update_column,
} from "../../store/slices/board_slice";

interface MenuAction {
  label: string;
  onClick: () => void;
  type: "safe" | "danger";
  icon: IconType;
  section: string;
  included: boolean;
}

const COLUMN_ACTIONS = (columnId: ID, dispatch: AppDispatch): MenuAction[] => [
  {
    label: "Настройки",
    onClick: () => alert("Настройки"),
    type: "safe",
    icon: RiSettings4Line,
    section: "0",
    included: false,
  },
  {
    label: "Переименовать",
    onClick: () => alert("Переименовать"),
    type: "safe",
    icon: RiEdit2Line,
    section: "1",
    included: false,
  },
  {
    label: "Дублировать",
    onClick: () => alert("Дублировать"),
    type: "safe",
    icon: RiFileCopyLine,
    section: "1",
    included: false,
  },
  {
    label: "Переместить",
    onClick: () => alert("Переместить"),
    type: "safe",
    icon: RiFolderReduceLine,
    section: "1",
    included: false,
  },
  {
    label: "Автоматизация",
    onClick: () => alert("Автоматизация"),
    type: "safe",
    icon: RiMagicLine,
    section: "1",
    included: false,
  },
  {
    label: "Удалить",
    onClick: () => {
      dispatch(delete_column(columnId));
    },
    type: "danger",
    icon: RiDeleteBin6Line,
    section: "2",
    included: true,
  },
];

interface Props {
  column: T_Column;
  tasks: T_Task[];
}

export function Column(props: Props) {
  const dispatch = useAppDispatch();
  const { column, tasks } = props;

  const [edit_title_column, set_edit_title_column] = useState(false);
  const [show_window_column, set_show_window_column] = useState(false);

  const quick_menu_column_ref = useRef<HTMLDivElement | null>(null);
  const title_input_ref = useRef<HTMLInputElement>(null);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "Column", column },
    disabled: edit_title_column,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const tasks_id = useMemo(() => tasks.map((task) => task.id), [tasks]);

  // Мемоизация actions с правильными зависимостями
  const actions = useMemo(
    () => COLUMN_ACTIONS(column.id, dispatch),
    [column.id, dispatch]
  );

  // Обработчик клика вне меню с useCallback
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      quick_menu_column_ref.current &&
      !quick_menu_column_ref.current.contains(event.target as Node)
    ) {
      set_show_window_column(false);
    }
  }, []);

  const handleAddTask = useCallback(() => {
    dispatch(
      add_task({
        id: generate_id(),
        column_id: column.id,
        title: `Без названия`,
      })
    );
  }, [dispatch, column.id]);

  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(
        update_column({
          id: column.id,
          changes: {
            title: event.target.value,
          },
        })
      );
    },
    [dispatch, column.id]
  );

  const handleTitleBlur = useCallback(() => {
    set_edit_title_column(false);
  }, []);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      set_edit_title_column(false);
    }
  }, []);

  const toggleMenu = useCallback(() => {
    set_show_window_column((prev) => !prev);
  }, []);

  // Фокус на input при редактировании
  useEffect(() => {
    if (edit_title_column && title_input_ref.current) {
      title_input_ref.current.focus();
      title_input_ref.current.select();
    }
  }, [edit_title_column]);

  // Обработчик клика вне меню с правильной подпиской
  useEffect(() => {
    if (show_window_column) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [show_window_column, handleClickOutside]); // Добавляем handleClickOutside в зависимости

  const renderColumnHeader = () => (
    <div className={clsx(styled["column-header"])}>
      <div className={clsx(styled["header"])}>
        <div className={clsx(styled["header-container"])}>
          <div className={clsx(styled["header-left"])}>
            <span
              className={clsx(styled["button-column-move"])}
              aria-label="Переместить колонку"
              {...attributes}
              {...listeners}
            >
              <RiMenu5Fill />
            </span>
            <span
              className={clsx(styled["column-title"])}
              onClick={() => set_edit_title_column(true)}
              role="button"
              aria-label="Редактировать название колонки"
              tabIndex={0}
            >
              {!edit_title_column && column.title}
              {edit_title_column && (
                <input
                  ref={title_input_ref}
                  value={column.title}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  aria-label="Название колонки"
                />
              )}
            </span>
          </div>
          <div className={clsx(styled["header-right"])}>
            <button
              className={clsx(styled["header-button"])}
              onClick={toggleMenu}
              aria-label="Меню колонки"
              aria-expanded={show_window_column}
              aria-haspopup="true"
            >
              <RiMore2Fill />
            </button>
          </div>
        </div>
      </div>
      <button
        className={clsx(styled["button-column-add-task"])}
        onClick={handleAddTask}
        aria-label={`Добавить задачу в колонку ${column.title}`}
      >
        Добавить задачу
      </button>
    </div>
  );

  if (isDragging) {
    return (
      <section
        className={clsx(styled["column"])}
        ref={setNodeRef}
        style={style}
        aria-label={`Перетаскиваемая колонка: ${column.title}`}
      >
        {renderColumnHeader()}
      </section>
    );
  }

  return (
    <section
      className={clsx(styled["column"])}
      ref={setNodeRef}
      style={style}
      aria-label={`Колонка: ${column.title}`}
    >
      {renderColumnHeader()}

      <ul
        className={clsx(styled["list"])}
        aria-label={`Задачи в колонке ${column.title}`}
      >
        <SortableContext items={tasks_id}>
          {tasks.map((task) => (
            <li key={task.id}>
              <Task task={task} />
            </li>
          ))}
        </SortableContext>
      </ul>

      {show_window_column && (
        <div
          className={clsx(styled["container-quick-menu"])}
          ref={quick_menu_column_ref}
          role="dialog"
          aria-label="Меню действий колонки"
        >
          <Quick_Menu actions={actions} />
        </div>
      )}
    </section>
  );
}
