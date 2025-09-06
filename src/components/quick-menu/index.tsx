import clsx from "clsx";
import styled from "./style.module.scss";
import { useMemo, useCallback, type KeyboardEvent } from "react";

import type { IconType } from "react-icons";

interface Props {
  actions: {
    onClick: () => void;
    label: string;
    type: "danger" | "safe";
    icon: IconType;
    section: string;
    included: boolean;
  }[];
}

export function Quick_Menu(props: Props) {
  const { actions } = props;

  // Мемоизация группировки действий
  const groupedActions = useMemo(() => {
    return actions.reduce((acc, action) => {
      if (!acc[action.section]) {
        acc[action.section] = [];
      }
      acc[action.section].push(action);
      return acc;
    }, {} as Record<string, typeof actions>);
  }, [actions]);

  // Обработчик клавиатуры для элементов меню
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLLIElement>, onClick: () => void) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    },
    []
  );

  return (
    <div role="menu" aria-label="Быстрое меню">
      <ul className={clsx(styled["quick-menu"])}>
        {Object.keys(groupedActions).map((section) => (
          <li key={section} className={clsx(styled["section"])}>
            <ul role="group" aria-label={`Секция ${section}`}>
              {groupedActions[section].map((action, index) => {
                const isEnabled = action.included;

                return (
                  <li
                    key={index}
                    role="menuitem"
                    tabIndex={isEnabled ? 0 : -1}
                    aria-disabled={!isEnabled}
                    className={clsx(
                      styled["list-item"],
                      action.type === "danger" && styled["list-item-danger"],
                      action.type === "safe" && styled["list-item-safe"],
                      !isEnabled && styled["list-item-disabled"]
                    )}
                    onClick={isEnabled ? action.onClick : undefined}
                    onKeyDown={
                      isEnabled
                        ? (e) => handleKeyDown(e, action.onClick)
                        : undefined
                    }
                  >
                    {action.icon && (
                      <span aria-hidden="true">
                        <action.icon className="icon" />
                      </span>
                    )}
                    <span>{action.label}</span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
