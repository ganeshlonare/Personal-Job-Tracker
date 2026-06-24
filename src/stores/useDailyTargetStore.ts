import { create } from "zustand";
import type { DailyTargetCategory } from "@/lib/dailyTargetConfig";

interface DailyTargetStore {
  isOpen: boolean;
  activeCategory: DailyTargetCategory;
  open: (category?: DailyTargetCategory) => void;
  close: () => void;
  setActiveCategory: (category: DailyTargetCategory) => void;
}

export const useDailyTargetStore = create<DailyTargetStore>((set) => ({
  isOpen: false,
  activeCategory: "application",
  open: (category = "application") =>
    set({ isOpen: true, activeCategory: category }),
  close: () => set({ isOpen: false }),
  setActiveCategory: (category) => set({ activeCategory: category }),
}));
