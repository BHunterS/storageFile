import multer, { Multer, StorageEngine } from "multer";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import { NextFunction, RequestHandler, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import File from "../models/file.model";
import Folder from "../models/folder.model";

import { createError } from "../utils/createError";

import {
    fileType,
    renameFileRequest,
    User,
    RequestWithUserId,
    RequestWithStorageName,
} from "types";

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
        const {
            type,
            folderPath = "/",
        }: { type: fileType; folderPath: string } = req.body;
        const file: Express.Multer.File | undefined = req.file;

        if (!file) throw createError(400, "File not found!");

        if (folderPath !== "/") {
            const folder = await Folder.findOne({
                path: folderPath,
                accountId,
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
        });

        await newFile.save();

        res.status(201).json({
            success: true,
            message: "File succesfully uploaded!",
        });
    } catch (error) {
        next(error);
    }
};

export const getFile = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId: string = req.userId!;
        const { fileId } = req.params;
        const download: boolean = req.query.download === "true";

        const file = await File.findOne({ _id: fileId, accountId });
        if (!file) throw createError(404, "File not found!");

        const filePath: string = path.join(
            __dirname,
            "..",
            "..",
            "uploads",
            accountId,
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
        res.sendFile(filePath);
    } catch (error) {
        next(error);
    }
};

export const renameFile = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId: string = req.userId!;
        const { fileId } = req.params;
        const { newName }: renameFileRequest = req.body;

        if (!fileId || !newName)
            throw createError(400, "Both fileId and newName are required!");

        const fileDoc = await File.findOne({ _id: fileId, accountId });
        if (!fileDoc) throw createError(404, "File not found!");

        const extension: string = fileDoc.extension
            ? `.${fileDoc.extension}`
            : path.extname(fileDoc.name);

        let finalName: string = newName + extension;

        if (fileDoc.name === finalName) {
            res.status(200).json({
                success: true,
                message: "File renamed successfully!",
            });
        }

        const uploadsDir: string = path.join(
            __dirname,
            "..",
            "..",
            "uploads",
            accountId
        );
        let newPath: string = path.join(uploadsDir, finalName);
        let counter: number = 1;

        while (fs.existsSync(newPath)) {
            const numberedName: string = `${newName} (${counter})${extension}`;
            newPath = path.join(uploadsDir, numberedName);
            finalName = numberedName;
            counter++;
        }

        const oldPath: string = path.join(uploadsDir, fileDoc.name);
        fs.renameSync(oldPath, newPath);

        fileDoc.name = finalName;
        fileDoc.url = `${process.env.SERVER_URL}/api/files/${finalName}`;
        fileDoc.folderPath = path.join("uploads", accountId, finalName);
        await fileDoc.save();

        res.status(200).json({
            success: true,
            message: "File renamed successfully!",
        });
    } catch (error) {
        next(error);
    }
};

export const deleteFile = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId: string = req.userId!;
        const { fileId } = req.params;
        const { permanent = false } = req.query;

        if (!fileId) throw createError(400, "File name is required!");

        const fileDoc = await File.findOne({ _id: fileId, accountId });
        if (!fileDoc) throw createError(404, "File not found!");

        if (permanent || fileDoc.isDeleted) {
            const filePath: string = path.join(
                __dirname,
                "..",
                "..",
                "uploads",
                accountId,
                fileDoc.name
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

        res.status(200).json({
            success: true,
            message: "File deleted successfully!",
        });
    } catch (error) {
        next(error);
    }
};

export const restoreFile = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const { fileId } = req.params;
        const accountId: string = req.userId!;

        const file = await File.findOne({
            _id: fileId,
            accountId,
            isDeleted: true,
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
                accountId,
                isDeleted: false,
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
                accountId,
                folderPath: targetPath,
                name: fileName,
                isDeleted: false,
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
        file.url = `${process.env.SERVER_URL}/api/files/${fileName}`;
        file.originalPath = undefined;

        await file.save();

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
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const { fileId } = req.params;
        const accountId: string = req.userId!;

        const file = await File.findOne({
            _id: fileId,
            accountId,
            isDeleted: false,
        });
        if (!file) throw createError(404, "File not found!");

        file.isFavorite = !file.isFavorite;
        await file.save();

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

// export const shareFileWithUsers = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const accountId = req.userId;
//         const { fileId, emails } = req.body;

//         if (!fileId || !Array.isArray(emails) || emails.length === 0) {
//             throw createError(400, "fileId and email are required");
//         }

//         const file = await File.findOne({ _id: fileId, accountId });
//         if (!file) {
//             throw createError(404, "File not found or access denied");
//         }

//         const usersToShare = await User.find({ email: { $in: emails } });

//         if (!usersToShare.length) {
//             throw createError(404, "No users found with provided emails");
//         }

//         const newUserIds: string[] = usersToShare
//             .map((user) => user._id as string)
//             .filter((id) => !file.users.map((u) => u.toString()).includes(id));

//         file.users.push(
//             ...newUserIds.map((id) => new mongoose.Types.ObjectId(id))
//         );
//         await file.save();

//         res.status(200).json({
//             success: true,
//             message: "File shared successfully",
//             sharedWith: usersToShare.map((u) => u.email),
//         });
//     } catch (error) {
//         next(error);
//     }
// };
