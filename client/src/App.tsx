import { useState, useEffect } from "react";

import { useAuthStore } from "@/store/authStore";

import { getFolderContent, createFolder } from "./api/folder";

import { useQueryParams } from "./hooks/useQueryParams";

import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
} from "@radix-ui/react-context-menu";

import MobileNavigation from "@/components/MobileNavigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Sort from "@/components/Sort";
import FileCard from "@/components/FileCard";
import FolderCard from "@/components/FolderCard";

import { Folder, SFile } from "@/types";
import { GetFolderContentResponse } from "./types/folder";
import Breadcrumb from "./components/Breadcrumb";
import { FolderPlus, Loader } from "lucide-react";

function App() {
    const { type, query, sort } = useQueryParams();
    const { user } = useAuthStore();

    const [currentFolder, setCurrentFolder] = useState<string>("/");
    const [loading, setLoading] = useState<boolean>(false);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [files, setFiles] = useState<SFile[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);

    useEffect(() => {
        const fetchFolderContents = async () => {
            try {
                setLoading(true);
                const { folders, files }: GetFolderContentResponse =
                    await getFolderContent(currentFolder, type, query, sort);
                setFolders(folders);
                setFiles(files);
            } catch (err) {
                console.error("Error fetching folder contents:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFolderContents();
    }, [currentFolder, query, reloadTrigger, sort, type]);

    const handleFolderClick = (folderPath: string) => {
        setCurrentFolder(folderPath);
    };

    const handleNavigateUp = () => {
        if (currentFolder === "/") return;

        const lastSlashIndex = currentFolder.lastIndexOf("/");
        if (lastSlashIndex <= 0) {
            setCurrentFolder("/");
        } else {
            setCurrentFolder(currentFolder.substring(0, lastSlashIndex));
        }
    };

    const handleCreateFolder = async (folderName: string) => {
        try {
            await createFolder(folderName, currentFolder);

            const { folders } = await getFolderContent(
                currentFolder,
                type,
                query,
                sort
            );
            setFolders(folders);
            setReloadTrigger((prev) => !prev);
        } catch (err) {
            console.error("Error creating folder:", err);
        }
    };

    return (
        <main className="flex h-screen">
            <Sidebar {...user} />

            <section className="flex h-full flex-1 flex-col">
                <MobileNavigation
                    folderPath={currentFolder}
                    accountId={user?._id}
                    {...user}
                />
                <Header folderPath={currentFolder} accountId={user?._id} />
                <ContextMenu>
                    <ContextMenuTrigger>
                        <div className="main-content">
                            <div className="page-container">
                                <section className="w-full">
                                    <Breadcrumb
                                        path={currentFolder}
                                        onNavigate={setCurrentFolder}
                                        onNavigateUp={handleNavigateUp}
                                    />

                                    <h1 className="h1 capitalize">{type}</h1>

                                    <div className="total-size-section">
                                        <p className="body-1">
                                            Total:{" "}
                                            <span className="h5">0 MB</span>
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

                                <h2 className="h3 mb-4 self-start">Folders</h2>
                                {folders.length > 0 ? (
                                    <section className="file-list">
                                        {folders.map((folder: Folder) => (
                                            <FolderCard
                                                key={folder._id}
                                                folder={folder}
                                                onClick={() => {}}
                                                onDoubleClick={() =>
                                                    handleFolderClick(
                                                        folder.path
                                                    )
                                                }
                                            />
                                        ))}
                                    </section>
                                ) : (
                                    <p className="empty-list">
                                        No folders found!
                                    </p>
                                )}

                                <h2 className="h3 mb-4 self-start">Files</h2>
                                {files.length > 0 ? (
                                    <section className="file-list">
                                        {files.map((file: SFile) => (
                                            <FileCard
                                                key={file._id}
                                                file={file}
                                            />
                                        ))}
                                    </section>
                                ) : (
                                    <p className="empty-list">
                                        No files uploaded
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
                            <FolderPlus className="h-4 w-4 text-zinc-500" />
                            <span>Create Folder</span>
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
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
