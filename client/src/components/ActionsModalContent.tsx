import React, { useEffect, useState } from "react";

import { X } from "lucide-react";

import { useLoadingStore } from "@/store/loadingStore";

import { getFolderDetails } from "@/api/folder";

import { convertFileSize, formatDateTime } from "@/utils/helpers";

import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { SFile, Folder } from "@/types";
import { GetFolderDetailsResponse } from "@/types/folder";

const ImageThumbnail = ({ file }: { file: SFile }) => (
    <div className="file-details-thumbnail">
        <Thumbnail
            type={file.type}
            extension={file.extension}
            url={`${file.url}${file._id}`}
        />
        <div className="flex flex-col">
            <p className="subtitle-2 mb-1">{file.name}</p>
            <FormattedDateTime date={file.createdAt} className="caption" />
        </div>
    </div>
);

const DetailRow = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex">
        <p className="file-details-label text-left">{label}</p>
        <p className="file-details-value text-left">{value}</p>
    </div>
);

export const FileDetails = ({ file }: { file: SFile }) => {
    return (
        <>
            <ImageThumbnail file={file} />
            <div className="space-y-4 px-2 pt-2">
                <DetailRow label="Format:" value={file.extension} />
                <DetailRow label="Size:" value={convertFileSize(file.size)} />
                <DetailRow label="Owner:" value={file.ownerFullName} />
                <DetailRow
                    label="Last edit:"
                    value={formatDateTime(file.updatedAt)}
                />
            </div>
        </>
    );
};

export const FolderDetails = ({ folder }: { folder: Folder }) => {
    const [folderDetails, setFolderDetails] =
        useState<GetFolderDetailsResponse | null>(null);
    const { showLoading, hideLoading } = useLoadingStore();

    useEffect(() => {
        const fetchFolderDetails = async () => {
            showLoading();

            const data = await getFolderDetails(folder._id);
            setFolderDetails(data);

            hideLoading();
        };

        fetchFolderDetails();
    }, [folder._id, hideLoading, showLoading]);

    return (
        <>
            <div className="space-y-4 px-2 pt-2">
                <DetailRow label="Name:" value={folder.name} />
                <DetailRow
                    label="File count:"
                    value={folderDetails?.details.fileCount?.toString()}
                />
                <DetailRow
                    label="Total size:"
                    value={convertFileSize(folderDetails?.details.totalSize)}
                />

                <DetailRow
                    label="Last edit:"
                    value={formatDateTime(folder.updatedAt)}
                />
                <DetailRow
                    label="Created at:"
                    value={formatDateTime(folder.createdAt)}
                />
            </div>
        </>
    );
};

interface Props {
    file: SFile;
    onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
    onRemove: (email: string) => void;
}

export const ShareInput = ({ file, onInputChange, onRemove }: Props) => {
    return (
        <>
            <ImageThumbnail file={file} />

            <div className="share-wrapper">
                <p className="subtitle-2 pl-1 text-light-100">
                    Share file with other users
                </p>
                <Input
                    type="email"
                    placeholder="Enter email address"
                    onChange={(e) =>
                        onInputChange(e.target.value.trim().split(","))
                    }
                    className="share-input-field"
                />
                <div className="pt-4">
                    <div className="flex justify-between">
                        <p className="subtitle-2 text-light-100">Shared with</p>
                        <p className="subtitle-2 text-light-200">
                            {file.users.length} users
                        </p>
                    </div>

                    <ul className="pt-2">
                        {file.users.map((email: string) => (
                            <li
                                key={email}
                                className="flex items-center justify-between gap-2"
                            >
                                <p className="subtitle-2">{email}</p>
                                <Button
                                    onClick={() => onRemove(email)}
                                    className="share-remove-user"
                                >
                                    <X
                                        size={24}
                                        className="remove-icon"
                                        aria-label="Remove"
                                    />
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};
