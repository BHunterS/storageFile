import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { FolderPlus, Loader, Delete } from "lucide-react";

import { useUploadStore } from "@/store/uploadStore";
import { useLoadingStore } from "@/store/loadingStore";
import { useStorageStore } from "@/store/storageStore";

import {
    getFolderContent,
    createFolder,
    deleteFolder,
    getFolderDetails,
} from "@/api/folder";

import { useQueryParams } from "./hooks/useQueryParams";

import { convertFileSize } from "@/utils/helpers";

import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
} from "@radix-ui/react-context-menu";

import { Separator } from "@/components/ui/separator";

import Sort from "@/components/Sort";
import FileCard from "@/components/FileCard";
import FolderCard from "@/components/FolderCard";
import FolderBreadcrumb from "@/components/FolderBreadcrumb";

import { Folder, SFile } from "@/types";

function App() {
    const { query, sort } = useQueryParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
    const [totalRootSize, setTotalRootSize] = useState<string>("0 KB");

    const { loading, showLoading, hideLoading } = useLoadingStore();
    const { currentFolder, setCurrentFolder, files, setFiles } =
        useStorageStore();
    const { trigger, toggleTrigger } = useUploadStore();

    const handleFolderClick = (folderId: string) => {
        setSelectedFolders((prevSelected) => {
            if (prevSelected.includes(folderId)) {
                return prevSelected.filter((id) => id !== folderId);
            } else {
                return [...prevSelected, folderId];
            }
        });
    };

    const handleFolderDoubleClick = (folderPath: string) => {
        setSelectedFolders([]);
        navigate(encodeURI(folderPath));
    };

    const handleCreateFolder = async (folderName: string) => {
        try {
            await createFolder(folderName, currentFolder);
            toggleTrigger();
        } catch (err) {
            console.error("Error creating folder:", err);
        }
    };

    const handleDelete = async () => {
        try {
            await Promise.all(
                selectedFolders.map((folderId) => deleteFolder(folderId))
            );

            setFolders((prevFolders) =>
                prevFolders.filter(
                    (folder) => !selectedFolders.includes(folder._id)
                )
            );

            setSelectedFolders([]);
            toggleTrigger();
        } catch (error) {
            console.error("Error while delete folders:", error);
        }
    };

    useEffect(() => {
        const fetchFolderContents = async () => {
            try {
                showLoading();

                const response = await getFolderContent(
                    currentFolder,
                    query,
                    sort
                );

                setFolders(response.folders);
                setFiles(response.files);
            } catch (err) {
                console.log(err);
                throw err;
            } finally {
                hideLoading();
            }
        };

        fetchFolderContents();
    }, [
        currentFolder,
        query,
        sort,
        trigger,
        hideLoading,
        showLoading,
        setFiles,
        setFolders,
    ]);

    useEffect(() => {
        const folderPath = decodeURIComponent(location.pathname) || "/";
        setCurrentFolder(folderPath);
    }, [location.pathname, setCurrentFolder]);

    useEffect(() => {
        const fetchFolderDetails = async () => {
            showLoading();

            const data = await getFolderDetails("root");
            setTotalRootSize(convertFileSize(data.details.totalSize));

            hideLoading();
        };

        fetchFolderDetails();
    }, [hideLoading, showLoading, trigger]);

    return (
        <ContextMenu>
            <ContextMenuTrigger className="flex-1 pb-4 overflow-hidden">
                <div className="main-content">
                    <div className="page-container">
                        <section className="w-full">
                            <FolderBreadcrumb currentFolder={currentFolder} />

                            <div className="total-size-section">
                                <p className="body-1">
                                    Total:{" "}
                                    <span className="h5">{totalRootSize}</span>
                                </p>

                                <div className="sort-container">
                                    <p className="body-1 hidden text-light-200 sm:block">
                                        Sort by:
                                    </p>

                                    <Sort />
                                </div>
                            </div>
                        </section>

                        {loading && (
                            <div className="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-10">
                                <Loader className="w-12 h-12 animate-spin text-blue-500" />
                            </div>
                        )}

                        {folders.length > 0 || files.length > 0 ? (
                            <section className="file-list">
                                {folders.map((folder: Folder) => (
                                    <FolderCard
                                        key={folder._id}
                                        folder={folder}
                                        isSelected={selectedFolders.includes(
                                            folder._id
                                        )}
                                        onClick={() => {
                                            handleFolderClick(folder._id);
                                        }}
                                        onDoubleClick={() => {
                                            const path = folder.isDeleted
                                                ? `/trash${folder.path}`
                                                : folder.path;
                                            handleFolderDoubleClick(path);
                                        }}
                                    />
                                ))}
                                {files.map((file: SFile) => (
                                    <FileCard key={file._id} file={file} />
                                ))}
                            </section>
                        ) : (
                            <p className="empty-list">
                                No content here! Create or download some files.
                            </p>
                        )}
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64 rounded-xl p-1 shadow-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                <ContextMenuItem
                    onClick={() => handleCreateFolder("New Folder")}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                >
                    <FolderPlus className="h-6 w-6 text-zinc-500" />
                    <span>Create Folder</span>
                </ContextMenuItem>
                {selectedFolders.length > 0 && (
                    <>
                        <Separator />
                        <ContextMenuItem
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                        >
                            <Delete className="h-6 w-6 text-rose-700" />
                            <span>Delete</span>
                        </ContextMenuItem>
                    </>
                )}
            </ContextMenuContent>
        </ContextMenu>
    );
}

export default App;
