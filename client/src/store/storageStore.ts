import { create } from "zustand";

import { SFile } from "@/types";

interface FolderStore {
    currentFolder: string;
    files: SFile[];
    setCurrentFolder: (path: string) => void;
    setFiles: (files: SFile[]) => void;
}

export const useStorageStore = create<FolderStore>((set) => ({
    currentFolder: "/",
    files: [],
    setCurrentFolder: (path) => set({ currentFolder: path }),
    setFiles: (files) => set({ files }),
}));
