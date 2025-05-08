export type FileType = "document" | "image" | "video" | "audio" | "other";

export interface BaseResponse {
    success: boolean;
    message: string;
}

export interface SFile {
    _id: string;
    name: string;
    url: string;
    type: FileType;
    extension: string;
    folderPath: string;
    accountId: string;
    size: number;
    users: string[];
    ownerFullName: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    isDeleted?: boolean;
}

export interface Folder {
    _id: string;
    name: string;
    path: string;
    parentFolder: string;
    accountId: string;
    users: string[];
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    isDeleted?: boolean;
}

export interface ActionType {
    label: string;
    icon: string;
    value: string;
}
