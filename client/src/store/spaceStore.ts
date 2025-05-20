import { create } from "zustand";

interface SpaceStore {
    currentSpace: string;
    setCurrentSpace: (currentSpace: string) => void;
}

export const useSpaceStore = create<SpaceStore>((set) => ({
    currentSpace: "personal",
    setCurrentSpace: (space: string) => set({ currentSpace: space }),
}));
