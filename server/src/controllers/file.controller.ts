import multer, { Multer, StorageEngine } from "multer";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import { NextFunction, RequestHandler, Response } from "express";

import File from "../models/file.model";
import Folder from "../models/folder.model";

import { createError } from "../utils/createError";

import {
    accountId,
    fileType,
    renameFileRequest,
    User,
    RequestWithUserId,
} from "types";

const storage: StorageEngine = multer.diskStorage({
    destination: function (
        req: RequestWithUserId,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ) {
        const accountId: accountId = req.userId;
        if (accountId) {
            const uploadDir: string = path.join("uploads", accountId);

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            cb(null, uploadDir);
        }
    },

    filename: function (
        req: RequestWithUserId,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
    ) {
        const accountId: accountId = req.userId;
        if (accountId) {
            const uploadDir: string = path.join("uploads", accountId);

            const originalName: string = file.originalname;
            const extension: string = path.extname(originalName);
            const baseName: string = path.basename(originalName, extension);
            let finalName: string = originalName;
            let counter: number = 0;

            while (fs.existsSync(path.join(uploadDir, finalName))) {
                counter++;
                finalName = `${baseName} (${counter})${extension}`;
            }

            cb(null, finalName);
        }
    },
});

const upload: Multer = multer({ storage });

export const uploadSingle: RequestHandler = upload.single("file");
export const uploadFile = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            type,
            folderPath = "/",
        }: { type: fileType; folderPath: string } = req.body;
        const file: Express.Multer.File | undefined = req.file;

        if (!file) throw createError(400, "File not found!");

        const accountId = req.userId;
        if (!accountId) throw createError(401, "User is not authorized!");

        if (folderPath !== "/") {
            const folder = await Folder.findOne({
                path: folderPath,
                accountId,
            });

            if (!folder) throw createError(404, "Parent folder not found!");
        }

        const newFile = new File({
            name: file.filename,
            url: `${process.env.SERVER_URL}/api/files/${file.filename}`,
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
        const accountId: accountId = req.userId;
        const name: string = req.params.name;
        const download: boolean = req.query.download === "true";

        if (!accountId)
            throw createError(401, "Unauthorized - token not provided!");

        if (!name) {
            throw createError(400, "File name missing");
        }

        const filePath: string = path.join(
            __dirname,
            "..",
            "..",
            "uploads",
            accountId,
            name
        );

        const fileDoc = await File.findOne({ name });
        if (!fileDoc) throw createError(404, "File not found in database");

        if (fileDoc.accountId.toString() !== accountId)
            throw createError(403, "Access denied");

        if (!fs.existsSync(filePath))
            throw createError(405, "File not found on disk");

        const mimeType: string =
            mime.lookup(filePath) || "application/octet-stream";
        res.setHeader("Content-Type", mimeType);
        res.setHeader(
            "Content-Disposition",
            download ? `attachment; filename="${name}"` : "inline"
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
        const accountId: accountId = req.userId;
        const { fileId } = req.params;
        const { newName }: renameFileRequest = req.body;

        if (!accountId) throw createError(401, "User is not authorized!");
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
            accountId.toString()
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
        fileDoc.folderPath = path.join(
            "uploads",
            accountId.toString(),
            finalName
        );
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
        const accountId: accountId = req.userId;
        const { fileId } = req.params;
        const { permanent = false } = req.query;

        if (!accountId) throw createError(401, "User not authorized!");
        if (!fileId) throw createError(400, "File name is required!");

        const fileDoc = await File.findOne({ _id: fileId, accountId });
        if (!fileDoc) throw createError(404, "File not found!");

        if (permanent || fileDoc.isDeleted) {
            const filePath: string = path.join(
                __dirname,
                "..",
                "..",
                "uploads",
                accountId.toString(),
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

// export const shareFileWithUsers = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     try {
//         const accountId = req.userId;
//         const { fileId, emails } = req.body;

//         if (!fileId || !Array.isArray(emails) || emails.length === 0) {
//             throw createError(400, "fileId and email// TODO change name to ids are required");
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
