import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { FolderPlus, Loader, Delete } from "lucide-react";

import { AxiosError } from "axios";

import { useAuthStore } from "@/store/authStore";
import { useUploadStore } from "@/store/uploadStore";
import { useLoadingStore } from "@/store/loadingStore";

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

import MobileNavigation from "@/components/MobileNavigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Sort from "@/components/Sort";
import FileCard from "@/components/FileCard";
import FolderCard from "@/components/FolderCard";
import FolderBreadcrumb from "@/components/FolderBreadcrumb";
import Footer from "@/components/Footer";

import { Folder, SFile } from "@/types";

function App() {
    const { query, sort } = useQueryParams();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const { loading, showLoading, hideLoading } = useLoadingStore();

    const [currentFolder, setCurrentFolder] = useState<string>("/");
    const [files, setFiles] = useState<SFile[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
    const [totalRootSize, setTotalRootSize] = useState<string>("0 KB");

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
                const error = err as AxiosError;

                if (error.response && error.response.status === 404) {
                    setFolders([]);
                    setFiles([]);
                }
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
        location.pathname,
        showLoading,
        hideLoading,
    ]);

    useEffect(() => {
        const folderPath = decodeURIComponent(location.pathname) || "/";
        setCurrentFolder(folderPath);
    }, [location.pathname]);

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
        <main className="flex h-screen">
            <Sidebar />

            <section className="flex h-full flex-1 flex-col">
                <MobileNavigation
                    folderPath={currentFolder}
                    accountId={user?._id}
                    {...user}
                />
                <Header
                    folderPath={currentFolder}
                    accountId={user?._id}
                    files={files}
                    user={user}
                />
                <ContextMenu>
                    <ContextMenuTrigger className="flex-1 pb-4 overflow-hidden">
                        <div className="main-content">
                            <div className="page-container">
                                <section className="w-full">
                                    <FolderBreadcrumb
                                        currentFolder={currentFolder}
                                    />

                                    <div className="total-size-section">
                                        <p className="body-1">
                                            Total:{" "}
                                            <span className="h5">
                                                {totalRootSize}
                                            </span>
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
                                                    handleFolderClick(
                                                        folder._id
                                                    );
                                                }}
                                                onDoubleClick={() => {
                                                    const path =
                                                        folder.isDeleted
                                                            ? `/trash${folder.path}`
                                                            : folder.path;
                                                    handleFolderDoubleClick(
                                                        path
                                                    );
                                                }}
                                            />
                                        ))}
                                        {files.map((file: SFile) => (
                                            <FileCard
                                                key={file._id}
                                                file={file}
                                            />
                                        ))}
                                    </section>
                                ) : (
                                    <p className="empty-list">
                                        No content here! Create or download some
                                        files.
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
                <Footer />
            </section>
        </main>
    );
}

export default App;
/*
users:
  fullName(string, 255, required)
  email(email, required)
  avatar(string, big size)
  accountId(string, 255, required)

files:
  name(string, 255, required)
  url(url, required)
  type(enum(document,image,video,audio,other), required)
  bucketField(string, 255, required)
  accoutId(string, 255, required)
  extension(string, 255)
  size(integer)
  users(string, big size, array of users)

relationship - files can only contain one users, users can belong to many files  
*/
