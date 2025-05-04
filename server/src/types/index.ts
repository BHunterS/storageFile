import { Request } from "express";
import { Types, Document } from "mongoose";

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

export interface User extends IUser {
    _id: Types.ObjectId;
}

export interface IFile extends Document {
    name: string;
    url: string;
    type: fileType;
    folderPath: string;
    accountId: Types.ObjectId;
    extension?: string;
    size?: number;
    users: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IFolder extends Document {
    name: string;
    path: string;
    parentFolder: string;
    accountId: Types.ObjectId | string;
    users?: Types.ObjectId[] | string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export type accountId = string | undefined;
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
