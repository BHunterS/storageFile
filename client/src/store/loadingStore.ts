import { create } from "zustand";

interface LoadingStore {
    loading: boolean;
    showLoading: () => void;
    hideLoading: () => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
    loading: false,
    showLoading: () => set({ loading: true }),
    hideLoading: () => set({ loading: false }),
}));
