import { create } from "zustand";

import { Item } from "../types/item";
import { MainState } from "./types";

export const useMainStore = create<MainState>((set) => ({
  items: [],
  setItems: (items: Item[]) => set({ items }),
}));
