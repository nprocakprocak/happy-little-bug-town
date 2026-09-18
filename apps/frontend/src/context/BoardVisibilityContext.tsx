"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface BoardVisibilityContextValue {
  gridCellsVisible: boolean;
  toggleGridCellsVisible: () => void;
  structureNamesVisible: boolean;
  toggleStructureNamesVisible: () => void;
}

const BoardVisibilityContext = createContext<BoardVisibilityContextValue | null>(null);

interface BoardVisibilityProviderProps {
  children: React.ReactNode;
}

function isEditableKeyboardTarget(element: HTMLElement): boolean {
  const tag = element.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }
  if (element.isContentEditable) {
    return true;
  }
  return false;
}

export function BoardVisibilityProvider({ children }: BoardVisibilityProviderProps) {
  const [gridCellsVisible, setGridCellsVisible] = useState(false);
  const [structureNamesVisible, setStructureNamesVisible] = useState(true);

  const toggleGridCellsVisible = useCallback(() => {
    setGridCellsVisible((prev) => !prev);
  }, []);

  const toggleStructureNamesVisible = useCallback(() => {
    setStructureNamesVisible((prev) => !prev);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement && isEditableKeyboardTarget(target)) {
        return;
      }

      if (event.key === "g" || event.key === "G") {
        event.preventDefault();
        toggleGridCellsVisible();
        return;
      }

      if (event.key === "b" || event.key === "B") {
        event.preventDefault();
        toggleStructureNamesVisible();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleGridCellsVisible, toggleStructureNamesVisible]);

  const value = useMemo(
    () => ({
      gridCellsVisible,
      toggleGridCellsVisible,
      structureNamesVisible,
      toggleStructureNamesVisible,
    }),
    [gridCellsVisible, toggleGridCellsVisible, structureNamesVisible, toggleStructureNamesVisible],
  );

  return (
    <BoardVisibilityContext.Provider value={value}>{children}</BoardVisibilityContext.Provider>
  );
}

export function useBoardVisibility(): BoardVisibilityContextValue {
  const context = useContext(BoardVisibilityContext);
  if (!context) {
    throw new Error("useBoardVisibility must be used within BoardVisibilityProvider");
  }
  return context;
}
