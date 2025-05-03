import { create } from "zustand";

interface UploadStore {
    trigger: boolean;
    toggleTrigger: () => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
    trigger: false,
    toggleTrigger: () => set((state) => ({ trigger: !state.trigger })),
}));
