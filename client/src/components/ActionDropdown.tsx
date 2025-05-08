import { useState } from "react";
import { Link } from "react-router-dom";

import { useUploadStore } from "@/store/uploadStore";
import { useLoadingStore } from "@/store/loadingStore";

import {
    renameFile,
    deleteFile,
    updateFileUsers,
    restoreFile,
    updateFileFavorite,
} from "@/api/file";
import { deleteFolder, renameFolder, restoreFolder } from "@/api/folder";

import { isFile } from "@/utils/helpers";

import { actionsDropdownItems, SERVER_URL } from "@/constants";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileDetails, FolderDetails } from "@/components/ActionsModalContent";

import { ActionType, BaseResponse, Folder, SFile } from "@/types";

const ActionDropdown = ({ item }: { item: SFile | Folder }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [action, setAction] = useState<ActionType | null>(null);
    const [name, setName] = useState(item.name);
    const [emails, setEmails] = useState<string[]>([]);

    const { toggleTrigger } = useUploadStore();
    const { showLoading, hideLoading } = useLoadingStore();

    const fileActions = {
        rename: (item: SFile) => renameFile(item._id, name),
        share: (item: SFile) => updateFileUsers(item._id, emails),
        delete: (item: SFile) => deleteFile(item._id),
        restore: (item: SFile) => restoreFile(item._id),
        favorite: (item: SFile) => updateFileFavorite(item._id),
    };

    const folderActions = {
        rename: (item: Folder) => renameFolder(item._id, name),
        // TODO share folder
        // share: (item: Folder) => item,
        delete: (item: Folder) => deleteFolder(item._id),
        restore: (item: Folder) => restoreFolder(item._id),
    };

    const closeAllModals = () => {
        setIsModalOpen(false);
        setIsDropdownOpen(false);
        setAction(null);
        setName(item.name);
        setEmails([]);
    };

    const handleAction = async () => {
        if (!action) return;
        showLoading();
        let success: BaseResponse = { success: false, message: "" };

        try {
            if (isFile(item)) {
                success = await fileActions[
                    action.value as keyof typeof fileActions
                ](item as SFile);
            } else {
                success = await folderActions[
                    action.value as keyof typeof folderActions
                ](item as Folder);
            }

            if (success) {
                closeAllModals();
                toggleTrigger();
            }
        } catch (error) {
            console.error("Action failed:", error);
        } finally {
            hideLoading();
        }
    };

    // const handleRemoveUser = async (email: string) => {
    //     const updatedEmails = emails.filter((e) => e !== email);

    //     const success = await updateFileUsers({
    //         fileId: file._id,
    //         emails: updatedEmails,
    //     });

    //     if (success) setEmails(updatedEmails);
    //     closeAllModals();
    // };

    const handleClick = (actionItem: ActionType): void => {
        const list = [
            "rename",
            "share",
            "delete",
            "details",
            "restore",
            "favorite",
        ];

        setAction(actionItem);

        if (list.includes(actionItem.value)) {
            setIsModalOpen(true);
        }
    };

    const renderDialogContent = () => {
        if (!action) return null;

        const { value, label } = action;

        return (
            <DialogContent className="shad-dialog button">
                <DialogHeader className="flex flex-col gap-3">
                    <DialogTitle className="text-center text-light-100">
                        {label}
                    </DialogTitle>
                    {value === "rename" && (
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    )}
                    {value === "details" ? (
                        isFile(item) ? (
                            <FileDetails file={item as SFile} />
                        ) : (
                            <FolderDetails folder={item as Folder} />
                        )
                    ) : null}
                    {/*{value === "share" && (
                        <ShareInput
                            file={file}
                            onInputChange={setEmails}
                            onRemove={handleRemoveUser}
                        />
                    )} */}
                    {value === "delete" && (
                        <p className="delete-confirmation">
                            Are you sure you want to delete{` `}
                            <span className="delete-file-name">
                                {item.name}
                            </span>
                            ?
                        </p>
                    )}
                    {value === "restore" && (
                        <p className="delete-confirmation">
                            Are you sure you want to restore{" "}
                            <span className="delete-file-name">
                                {item.name}
                            </span>
                            ?
                        </p>
                    )}
                    {isFile(item) && value === "favorite" && (
                        <p className="delete-confirmation">
                            Are you sure you want to{" "}
                            {(item as SFile).isFavorite
                                ? "remove from"
                                : "add to"}{" "}
                            favorites{" "}
                            <span className="delete-file-name">
                                {item.name}
                            </span>
                            ?
                        </p>
                    )}
                </DialogHeader>
                {["rename", "delete", "share", "restore", "favorite"].includes(
                    value
                ) && (
                    <DialogFooter className="flex flex-col gap-3 md:flex-row">
                        <Button
                            onClick={closeAllModals}
                            className="modal-cancel-button"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAction}
                            className="modal-submit-button"
                        >
                            <p className="capitalize">{value}</p>
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        );
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
            >
                <DropdownMenuTrigger className="shad-no-focus">
                    <img
                        src="/assets/icons/dots.svg"
                        alt="dots"
                        width={34}
                        height={34}
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[200px] max-w-[200px]">
                    <DropdownMenuLabel className="max-w-[200px] truncate">
                        {item.name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {actionsDropdownItems
                        .filter((actionItem) => {
                            if (actionItem.value === "restore") {
                                return item.isDeleted;
                            }
                            if (actionItem.value === "favorite") {
                                return isFile(item) && !item.isDeleted;
                            }
                            return true;
                        })
                        .map((actionItem) => (
                            <DropdownMenuItem
                                key={actionItem.value}
                                className="shad-dropdown-item"
                                onClick={() => {
                                    handleClick(actionItem);
                                }}
                            >
                                {actionItem.value === "download" ? (
                                    <Link
                                        to={`${
                                            isFile(item)
                                                ? (item as SFile).url +
                                                  (item as SFile)._id +
                                                  "?download=true"
                                                : `${SERVER_URL}/api/folders/${item._id}/download`
                                        }`}
                                        download={item.name}
                                        className="flex items-center gap-2"
                                    >
                                        <img
                                            src={actionItem.icon}
                                            alt={actionItem.label}
                                            width={30}
                                            height={30}
                                        />
                                        {actionItem.label}
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={actionItem.icon}
                                            alt={actionItem.label}
                                            width={30}
                                            height={30}
                                        />
                                        {actionItem.label}
                                    </div>
                                )}
                            </DropdownMenuItem>
                        ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {renderDialogContent()}
        </Dialog>
    );
};
export default ActionDropdown;
