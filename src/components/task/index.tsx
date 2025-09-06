import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import styled from "./style.module.scss";

import type { ID, T_Task } from "../../types";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  RiDeleteBin6Line,
  RiEdit2Line,
  RiFileCopyLine,
  RiFolderReduceLine,
  RiMore2Fill,
  RiExternalLinkLine,
  RiLink,
  RiArchiveLine,
} from "react-icons/ri";
import type { IconType } from "react-icons";
import { Quick_Menu } from "../quick-menu";
import { useAppDispatch, type AppDispatch } from "../../store";
import { delete_task, update_task } from "../../store/slices/board_slice";

interface MenuAction {
  label: string;
  onClick: () => void;
  type: "safe" | "danger";
  icon: IconType;
  section: string;
  included: boolean;
}

const TASK_ACTIONS = (taskId: ID, dispatch: AppDispatch): MenuAction[] => [
  {
    label: "Открыть в новой вкладке",
    onClick: () => alert("Action clicked: Открыть в новой вкладке"),
    type: "safe" as const,
    icon: RiExternalLinkLine,
    section: "0",
    included: false,
  },
  {
    label: "Переименовать",
    onClick: () => alert("Action clicked: Переименовать"),
    type: "safe" as const,
    icon: RiEdit2Line,
    section: "1",
    included: false,
  },
  {
    label: "Дублировать",
    onClick: () => alert("Action clicked: Дублировать"),
    type: "safe" as const,
    icon: RiFileCopyLine,
    section: "1",
    included: false,
  },
  {
    label: "Переместить",
    onClick: () => alert("Action clicked: Переместить"),
    type: "safe" as const,
    icon: RiFolderReduceLine,
    section: "1",
    included: false,
  },
  {
    label: "Ссылка",
    onClick: () => alert("Action clicked: Ссылка"),
    type: "safe" as const,
    icon: RiLink,
    section: "1",
    included: false,
  },
  {
    label: "В архив",
    onClick: () => alert("Action clicked: В архив"),
    type: "danger" as const,
    icon: RiArchiveLine,
    section: "2",
    included: false,
  },
  {
    label: "Удалить",
    onClick: () => dispatch(delete_task(taskId)),
    type: "danger" as const,
    icon: RiDeleteBin6Line,
    section: "2",
    included: true,
  },
];

interface Props {
  task: T_Task;
}

export function Task(props: Props) {
  const dispatch = useAppDispatch();
  const { task } = props;

  const [edit_title_task, set_edit_title_task] = useState(false);
  const [show_window_task, set_show_window_task] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const quick_menu_task_ref = useRef<HTMLDivElement | null>(null);
  const title_input_ref = useRef<HTMLInputElement>(null);
  const menu_button_ref = useRef<HTMLButtonElement>(null);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
    disabled: edit_title_task,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  // Мемоизация actions с правильными зависимостями
  const actions = useMemo(
    () => TASK_ACTIONS(task.id, dispatch),
    [task.id, dispatch]
  );

  // Обработчик клика вне меню с useCallback
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      quick_menu_task_ref.current &&
      !quick_menu_task_ref.current.contains(event.target as Node) &&
      menu_button_ref.current &&
      !menu_button_ref.current.contains(event.target as Node)
    ) {
      set_show_window_task(false);
    }
  }, []);

  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(
        update_task({
          id: task.id,
          changes: { title: event.target.value },
        })
      );
    },
    [dispatch, task.id]
  );

  const handleTitleBlur = useCallback(() => {
    set_edit_title_task(false);
  }, []);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") {
      set_edit_title_task(false);
    }
  }, []);

  const toggleMenu = useCallback((e: React.MouseEvent) => {
    set_show_window_task((prev) => !prev);
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  // Фокус на input при редактировании
  useEffect(() => {
    if (edit_title_task && title_input_ref.current) {
      title_input_ref.current.focus();
      title_input_ref.current.select();
    }
  }, [edit_title_task]);

  // Обработчик клика вне меню с правильной подпиской
  useEffect(() => {
    if (show_window_task) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [show_window_task, handleClickOutside]);

  // Позиционирование меню при изменении размера окна/прокрутке
  useEffect(() => {
    if (show_window_task && menu_button_ref.current) {
      const updatePosition = () => {
        if (menu_button_ref.current) {
          const rect = menu_button_ref.current.getBoundingClientRect();
          setPosition({
            x: rect.right,
            y: rect.bottom + window.scrollY,
          });
        }
      };

      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);

      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  }, [show_window_task]);

  if (isDragging) {
    return (
      <article
        className={clsx(styled.task, styled.dragging)}
        ref={setNodeRef}
        style={style}
        aria-label={`Перетаскиваемая задача: ${task.title}`}
      >
        {task.title}
      </article>
    );
  }

  return (
    <>
      <article
        className={clsx(styled.task)}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        aria-label={`Задача: ${task.title}`}
      >
        <div className={clsx(styled["task-header"])}>
          <div className={clsx(styled.number)}>#{task.id}</div>
          <button
            ref={menu_button_ref}
            className={clsx(styled["header-button"])}
            onClick={toggleMenu}
            aria-label="Меню задачи"
            aria-expanded={show_window_task}
            aria-haspopup="true"
          >
            <RiMore2Fill />
          </button>
        </div>
        <div
          className={clsx(styled.title)}
          onClick={() => set_edit_title_task(true)}
          role="button"
          tabIndex={0}
          aria-label="Редактировать название задачи"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              set_edit_title_task(true);
            }
          }}
        >
          {!edit_title_task && task.title}
          {edit_title_task && (
            <input
              ref={title_input_ref}
              value={task.title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              aria-label="Название задачи"
            />
          )}
        </div>
      </article>

      {show_window_task && (
        <div
          className={clsx(styled["container-quick-menu"])}
          style={{
            position: "fixed",
            left: position.x,
            top: position.y,
          }}
          ref={quick_menu_task_ref}
          role="dialog"
          aria-label="Меню действий задачи"
        >
          <Quick_Menu actions={actions} />
        </div>
      )}
    </>
  );
}
