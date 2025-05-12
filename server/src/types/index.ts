import { Request } from "express";
import { Types, Document } from "mongoose";

// TODO delete unnecessary interfaces and do some refactoring
export interface IUser extends Document {
    email: string;
    name: string;
    password: string;
    avatar?: string;
    lastLogin: Date;
    isVerified: boolean;
    resetPasswordToken?: string;
    resetPasswordExpiresAt?: Date;
    verificationToken?: string;
    verificationTokenExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// TODO delete this
export interface User extends IUser {
    _id: Types.ObjectId;
}

export interface IFile extends Document {
    name: string;
    storageName: string;
    url: string;
    type: fileType;
    folderPath: string;
    accountId: Types.ObjectId;
    extension?: string;
    size?: number;
    users: Types.ObjectId[];
    isDeleted: boolean;
    deletedAt?: Date;
    originalPath?: string;
    createdAt: Date;
    updatedAt: Date;
    isFavorite: boolean;
}

export interface IFolder extends Document {
    name: string;
    path: string;
    parentFolder: string;
    accountId: Types.ObjectId | string;
    users?: Types.ObjectId[] | string[];
    isDeleted: boolean;
    deletedAt?: Date;
    originalPath?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IProfile {
    accountId: Types.ObjectId;
    bio?: string;
    location?: string;
    phone?: string;
    birthday?: Date;
}

export interface IRSAkeys {
    publicKey: string;
    privateKey: string;
    accountId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface GetProfileBody {
    avatar: string;
    name: string;
    email: string;
    bio?: string;
    location?: string;
    phone?: string;
    birthday?: Date;
}

export type fileType = "document" | "image" | "video" | "audio" | "other";
export type environmentVariable = string | undefined;

export interface getFilesByAccountIdRequest {
    types: string[];
    name: string;
    sort: string;
}

export interface renameFileRequest {
    oldName: string;
    newName: string;
}

export interface deleteFileRequest {
    name: string;
}

export interface RequestWithUserId extends Request {
    userId?: string;
}

export interface RequestWithStorageName extends Request {
    userId?: string;
    storageName?: string;
}
