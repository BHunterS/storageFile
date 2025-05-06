import { NextFunction, Response } from "express";
import fs from "fs";
import path from "path";

import File from "../models/file.model";
import Folder from "../models/folder.model";

import { createError } from "../utils/createError";
import { buildSortOptions, calculateDaysLeft } from "../utils/helpers";

import { RequestWithUserId, User } from "types";

export const getTrashContents = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId;
        const { query = "", sort = "" } = req.body;

        const filter: Record<string, any> = {
            accountId,
            isDeleted: true,
        };

        if (query) {
            filter.name = { $regex: query, $options: "i" };
        }

        const sortOptions: Record<string, 1 | -1> = buildSortOptions(
            sort || "deletedAt-desc"
        );

        const rawFiles = await File.find(filter)
            .sort(sortOptions)
            .populate<{ accountId: User }>({
                path: "accountId",
                select: "name",
            });

        const files = rawFiles.map((file) => {
            const user = file.accountId;
            return {
                ...file.toObject(),
                accountId: user._id,
                ownerFullName: user.name,
                daysUntilPermanentDeletion: calculateDaysLeft(file.deletedAt),
            };
        });

        const folderFilter: Record<string, any> = {
            accountId,
            isDeleted: true,
        };

        if (query) {
            folderFilter["name"] = { $regex: query, $options: "i" };
        }

        const folders = await Folder.find(folderFilter).sort(sortOptions);

        const processedFolders = folders.map((folder) => ({
            ...folder.toObject(),
            daysUntilPermanentDeletion: calculateDaysLeft(folder.deletedAt),
        }));

        res.status(200).json({
            success: true,
            message: "Trash contents retrieved successfully",
            folders: processedFolders,
            files,
        });
    } catch (error) {
        next(error);
    }
};

// Restore a file from trash
export const restoreFile = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const { fileId } = req.params;
        const accountId = req.userId;

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

async function getAllSubfolders(folderId: string) {
    const folder = await Folder.findById(folderId);
    if (!folder) throw createError(404, "Folder not found!");

    const subfolders = await Folder.find({ parentFolder: folder.path });
    const result = [folder];

    for (const subfolder of subfolders) {
        const subfolderChildren = await getAllSubfolders(
            subfolder._id as string
        );
        result.push(...subfolderChildren);
    }

    return result;
}

// TODO fix naming when restored like new folder (1)
// Restore a folder from trash
export const restoreFolder = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const { folderId } = req.params;
        const accountId = req.userId;

        const folder = await Folder.findOne({
            _id: folderId,
            accountId,
            isDeleted: true,
        });

        if (!folder) throw createError(404, "Folder not found in trash!");

        // Check if original parent folder still exists
        const originalParent = folder.originalPath || folder.parentFolder;
        let targetParent = originalParent;

        if (
            originalParent !== "/" &&
            !(await Folder.findOne({
                path: originalParent,
                accountId,
                isDeleted: false,
            }))
        ) {
            // If original parent doesn't exist, move to root
            targetParent = "/";
        }

        // Check for name conflicts in the target parent
        const baseName = folder.name;
        let folderName = baseName;
        let counter = 1;
        let path =
            targetParent === "/"
                ? `/${folderName}`
                : `${targetParent}/${folderName}`;

        while (
            await Folder.findOne({
                accountId,
                path,
                isDeleted: false,
            })
        ) {
            folderName = `${baseName} (${counter})`;
            path =
                targetParent === "/"
                    ? `/${folderName}`
                    : `${targetParent}/${folderName}`;
            counter++;
        }

        // Update folder
        const oldPath = folder.path;
        folder.isDeleted = false;
        folder.deletedAt = undefined;
        folder.parentFolder = targetParent;
        folder.name = folderName;
        folder.path = path;
        folder.originalPath = undefined;

        await folder.save();

        const files = await File.find({
            accountId,
            isDeleted: true,
            originalPath: { $regex: `^${oldPath}(/|$)` },
        });

        for (const file of files) {
            file.isDeleted = false;
            file.folderPath = file?.originalPath?.replace(oldPath, path) || "/";
            file.originalPath = undefined;
            file.deletedAt = undefined;
            await file.save();
        }

        // Restore all subfolders
        const subfolders = await getAllSubfolders(folderId);
        subfolders.shift();
        console.log(subfolders);

        for (const subfolder of subfolders) {
            const newSubfolderPath = subfolder.originalPath!.replace(
                oldPath,
                path
            );
            const newParentFolder = path.endsWith(
                subfolder.originalPath!.split("/").slice(-2)[0]
            )
                ? path
                : subfolder
                      .originalPath!.replace(oldPath, path)
                      .split("/")
                      .slice(0, -1)
                      .join("/");

            subfolder.isDeleted = false;
            subfolder.deletedAt = undefined;
            subfolder.path = newSubfolderPath;
            subfolder.parentFolder = newParentFolder;
            subfolder.originalPath = undefined;

            await subfolder.save();
        }

        res.status(200).json({
            success: true,
            message: "Folder successfully restored!",
            folder,
        });
    } catch (error) {
        next(error);
    }
};
