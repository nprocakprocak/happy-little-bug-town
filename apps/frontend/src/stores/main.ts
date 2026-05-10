import { Item } from "@happy-little-park/types";
import { MainState } from "./types";
import { create } from "zustand";

export const useMainStore = create<MainState>((set) => ({
  items: [],
  setItems: (items: Item[]) => set({ items }),
}));
