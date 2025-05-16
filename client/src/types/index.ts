import { JSX } from "react";

export type FileType = "document" | "image" | "video" | "audio" | "other";

export interface BaseResponse {
    success: boolean;
    message: string;
}

export interface SFile {
    _id: string;
    name: string;
    storageName: string;
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
    isDeleted: boolean;
    isFavorite?: boolean;
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
    isDeleted: boolean;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    lastLogin: string;
    isVerified: boolean;
    createdAt: string;
}

export interface Profile {
    accountId: string;
    bio?: string;
    location?: string;
    phone?: string;
    birthdate?: string;
}

export interface Space {
    _id: string;
    name: string;
    description?: string;
    owner: string | User;
    members: {
        user: string | User;
        role: "admin" | "editor" | "viewer";
        addedAt: Date;
    }[];
    logo: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// TODO actions
export type LogAction =
    | "create"
    | "rename"
    | "delete"
    | "move"
    // | "share"
    // | "copy"
    // | "paste"
    | "upload"
    | "restore"
    | "download"
    | "favorite";
export type LogType = "file" | "folder";

export interface Log {
    _id: string;
    accoundId: string;
    action: LogAction;
    targetType: LogType;
    targetName: string;
    targetMessage: string;
    createdAt: string;
    updatedAt: string;
}

export interface ActionType {
    label: string;
    icon: JSX.Element;
    value: string;
}
