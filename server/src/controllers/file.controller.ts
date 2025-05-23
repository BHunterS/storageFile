import multer, { Multer, StorageEngine } from "multer";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import { NextFunction, RequestHandler, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import File from "../models/file.model";
import Folder from "../models/folder.model";
import User from "../models/user.model";
import Log from "../models/log.model";

import { createError } from "../utils/createError";
import { isValidEmail } from "../utils/helpers";

import {
    fileType,
    RequestWithUserId,
    RequestWithStorageName,
    RequestWithScope,
} from "types";

const TARGET_TYPE = "file";

const storage: StorageEngine = multer.diskStorage({
    destination: function (
        req: RequestWithUserId,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ) {
        const accountId: string = req.userId!;
        const uploadDir: string = path.join("uploads", accountId);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },

    filename: function (
        req: RequestWithStorageName,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
    ) {
        const extension = path.extname(file.originalname);
        const uniqueName = uuidv4() + extension;

        req.storageName = uniqueName;

        cb(null, uniqueName);
    },
});

const upload: Multer = multer({ storage });

export const uploadSingle: RequestHandler = upload.single("file");
export const uploadFile = async (
    req: RequestWithStorageName,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;
        const storageName = req.storageName!;
        const scope = req.scope!;
        const {
            type,
            folderPath = "/",
        }: { type: fileType; folderPath: string; spaceId: string } = req.body;
        const file: Express.Multer.File | undefined = req.file;

        if (!file) throw createError(400, "File not found!");

        if (folderPath !== "/") {
            console.log();
            const folder = await Folder.findOne({
                path: folderPath,
                ...scope,
            });

            if (!folder) throw createError(404, "Parent folder not found!");
        }

        const newFile = new File({
            name: file.originalname,
            storageName,
            url: `${process.env.SERVER_URL}/api/files/`,
            type,
            folderPath,
            accountId,
            extension: path.extname(file.originalname).slice(1),
            size: file.size,
            users: [],
            spaceId: scope.spaceId,
        });

        await newFile.save();

        await Log.create({
            accountId,
            action: "upload",
            targetType: TARGET_TYPE,
            targetName: newFile.name,
            targetMessage: folderPath,
        });

        res.status(201).json({
            success: true,
            message: "File succesfully uploaded!",
        });
    } catch (error) {
        next(error);
    }
};

export const getFile = async (
    req: RequestWithScope,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId: string = req.userId!;
        const { fileId } = req.params;
        const scope = req.scope!;
        const download: boolean = req.query.download === "true";

        const user = await User.findById(accountId);
        const email = user?.email;

        const file = await File.findOne({
            _id: fileId,
            $or: [scope, { users: email }],
        });
        if (!file) throw createError(404, "File not found!");

        // TODO where find files? because file saves to creator directory
        const filePath: string = path.join(
            __dirname,
            "..",
            "..",
            "uploads",
            file.accountId.toString(),
            file.storageName
        );

        if (!fs.existsSync(filePath))
            throw createError(404, "File not found on disk");

        const mimeType: string =
            mime.lookup(filePath) || "application/octet-stream";
        res.setHeader("Content-Type", mimeType);
        res.setHeader(
            "Content-Disposition",
            download ? `attachment; filename="${file.name}"` : "inline"
        );

        if (download) {
            await Log.create({
                accountId,
                action: "download",
                targetType: TARGET_TYPE,
                targetName: file.name,
                targetMessage: "some",
            });
        }

        res.sendFile(filePath);
    } catch (error) {
        next(error);
    }
};

export const renameFile = async (
    req: RequestWithScope,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId: string = req.userId!;
        const scope = req.scope!;
        const { fileId } = req.params;
        const { newName }: { newName: string } = req.body;

        if (!fileId || !newName)
            throw createError(400, "Both fileId and newName are required!");

        const fileDoc = await File.findOne({ _id: fileId, ...scope });
        if (!fileDoc) throw createError(404, "File not found!");

        const extension: string = fileDoc.extension
            ? `.${fileDoc.extension}`
            : path.extname(fileDoc.name);

        let finalName: string = newName + extension;

        let counter: number = 1;
        while (
            await File.findOne({
                name: finalName,
                folderPath: fileDoc.folderPath,
                ...scope,
            })
        ) {
            finalName = `${newName} (${counter})${extension}`;
            counter++;
        }

        const oldName: string = fileDoc.name;
        fileDoc.name = finalName;
        await fileDoc.save();

        await Log.create({
            accountId,
            action: "rename",
            targetType: TARGET_TYPE,
            targetName: oldName,
            targetMessage: newName,
        });

        res.status(200).json({
            success: true,
            message: "File renamed successfully!",
        });
    } catch (error) {
        next(error);
    }
};

export const deleteFile = async (
    req: RequestWithScope,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId: string = req.userId!;
        const scope = req.scope!;
        const { fileId } = req.params;
        const { permanent = false } = req.query;

        if (!fileId) throw createError(400, "File name is required!");

        const fileDoc = await File.findOne({ _id: fileId, ...scope });
        if (!fileDoc) throw createError(404, "File not found!");

        const isPermanent = permanent || fileDoc.isDeleted;

        if (isPermanent) {
            const filePath: string = path.join(
                __dirname,
                "..",
                "..",
                "uploads",
                fileDoc.accountId.toString(),
                fileDoc.storageName
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            await File.deleteOne({ _id: fileDoc._id });
        } else {
            fileDoc.isDeleted = true;
            fileDoc.deletedAt = new Date();
            fileDoc.originalPath = fileDoc.folderPath;
            fileDoc.folderPath = "/";

            await fileDoc.save();
        }

        await Log.create({
            accountId,
            action: "delete",
            targetType: TARGET_TYPE,
            targetName: fileDoc.name,
            targetMessage: isPermanent ? "permanent" : "soft",
        });

        res.status(200).json({
            success: true,
            message: "File deleted successfully!",
        });
    } catch (error) {
        next(error);
    }
};

export const restoreFile = async (
    req: RequestWithScope,
    res: Response,
    next: NextFunction
) => {
    try {
        const { fileId } = req.params;
        const accountId: string = req.userId!;
        const scope = req.scope!;

        const file = await File.findOne({
            _id: fileId,
            isDeleted: true,
            ...scope,
        });

        if (!file) throw createError(404, "File not found in trash!");

        // Check if original path still exists
        const originalPath = file.originalPath || file.folderPath;
        let targetPath = originalPath;

        // If the path is not root, check if the folder exists
        if (
            originalPath !== "/" &&
            !(await Folder.findOne({
                path: originalPath,
                isDeleted: false,
                ...scope,
            }))
        ) {
            // If original folder doesn't exist, move to root
            targetPath = "/";
        }

        // Check for name conflicts in the target path
        const baseName = file.name.replace(/\.\w+$/, "");
        const extension = file.extension ? `.${file.extension}` : "";
        let fileName = `${baseName}${extension}`;
        let counter = 1;

        while (
            await File.findOne({
                folderPath: targetPath,
                name: fileName,
                isDeleted: false,
                ...scope,
            })
        ) {
            fileName = `${baseName} (${counter})${extension}`;
            counter++;
        }

        // Update file
        file.isDeleted = false;
        file.deletedAt = undefined;
        file.folderPath = targetPath;
        file.name = fileName;
        file.originalPath = undefined;

        await file.save();

        await Log.create({
            accountId,
            action: "restore",
            targetType: TARGET_TYPE,
            targetName: file.name,
            targetMessage: file.folderPath,
        });

        res.status(200).json({
            success: true,
            message: "File successfully restored!",
            file,
        });
    } catch (error) {
        next(error);
    }
};

export const updateFavorite = async (
    req: RequestWithScope,
    res: Response,
    next: NextFunction
) => {
    try {
        const { fileId } = req.params;
        const accountId: string = req.userId!;
        const scope = req.scope!;

        const file = await File.findOne({
            _id: fileId,
            isDeleted: false,
            ...scope,
        });
        if (!file) throw createError(404, "File not found!");

        file.isFavorite = !file.isFavorite;
        await file.save();

        await Log.create({
            accountId,
            action: "favorite",
            targetType: TARGET_TYPE,
            targetName: file.name,
            targetMessage: file.isFavorite ? "added to" : "removed from",
        });

        res.status(200).json({
            success: true,
            message: `File ${
                file.isFavorite ? "added to" : "removed from"
            } favorites!`,
            file,
        });
    } catch (error) {
        next(error);
    }
};

export const updateUsers = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;
        const { fileId, emails } = req.body;

        if (!fileId || !Array.isArray(emails) || emails.length === 0) {
            throw createError(400, "fileId and emails are required");
        }

        const uniqueValidEmails = [...new Set(emails)].filter((email) =>
            isValidEmail(email)
        );

        if (uniqueValidEmails.length === 0) {
            throw createError(400, "No valid emails provided");
        }

        const file = await File.findOne({ _id: fileId, accountId });
        if (!file) throw createError(404, "File not found");

        const usersToShare = await User.find({ email: { $in: emails } });

        if (!usersToShare.length) {
            throw createError(404, "No users found with provided emails");
        }

        const existingUserEmails = file.users.map((u) => u.toString());
        const newUserEmails: string[] = usersToShare
            .map((user) => user.email as string)
            .filter((email) => !existingUserEmails.includes(email));

        file.users.push(...newUserEmails);
        await file.save();

        res.status(200).json({
            success: true,
            message: "File shared successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const getSharedEmails = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;
        const { fileId } = req.params;

        const file = await File.findOne({ _id: fileId, accountId });
        let emails: string[] = [];

        if (file) emails = file.users;

        res.status(200).json({
            message: "Shared emails successfully founded",
            success: true,
            emails,
        });
    } catch (error) {
        next(error);
    }
};

export const removeSharedUser = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId!;
        const spaceId = req.spaceId;
        const { fileId, email } = req.params;

        if (spaceId)
            throw createError(400, "You cannot remove share files in space");

        if (!fileId || !email) {
            throw createError(400, "fileId and email are required");
        }

        const file = await File.findOne({ _id: fileId, accountId });
        if (!file) {
            throw createError(404, "File not found or access denied");
        }

        const wasShared = file.users.includes(email);
        if (!wasShared) {
            throw createError(
                400,
                "This user does not have access to the file"
            );
        }

        file.users = file.users.filter((u) => u !== email);
        await file.save();

        res.status(200).json({
            success: true,
            message: `Access revoked from ${email}`,
        });
    } catch (error) {
        next(error);
    }
};
