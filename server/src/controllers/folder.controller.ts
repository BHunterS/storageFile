import { NextFunction, Response } from "express";
import mongoose from "mongoose";
import archiver from "archiver";
import path from "path";
import fs from "fs";

import Folder from "../models/folder.model";
import File from "../models/file.model";
import Log from "../models/log.model";
import UserModel from "../models/user.model";

import { createError } from "../utils/createError";

import { RequestWithUserId, User } from "types";
import {
    buildFilter,
    buildSortOptions,
    getParentFolderFromPath,
} from "../utils/helpers";

const TARGET_TYPE = "folder";

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

export const createFolder = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, parentFolder = "/" } = req.body;
        const accountId: string = req.userId!;

        if (parentFolder !== "/") {
            const parentFolderExists = await Folder.findOne({
                path: parentFolder,
                accountId,
            });

            if (!parentFolderExists)
                throw createError(404, "Parent folder not found!");
        }

        let folderName = name;
        let path =
            parentFolder === "/" ? `/${name}` : `${parentFolder}/${name}`;

        let counter = 1;
        while (await Folder.findOne({ path, accountId })) {
            const baseName = name.replace(/\(\d+\)$/, "");
            folderName = `${baseName} (${counter})`;
            path =
                parentFolder === "/"
                    ? `/${folderName}`
                    : `${parentFolder}/${folderName}`;
            counter++;
        }

        const folder = new Folder({
            name: folderName,
            path,
            parentFolder,
            accountId,
        });

        await folder.save();

        await Log.create({
            accountId,
            action: "create",
            targetName: folderName,
            targetType: TARGET_TYPE,
            targetMessage: parentFolder,
        });

        res.status(201).json({
            success: true,
            message: "Folder successfully created!",
            folder,
        });
    } catch (error) {
        next(error);
    }
};

export const getFolders = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId: string = req.userId!;
        const { parentFolder = "/" } = req.body;

        const folders = await Folder.find({
            accountId,
            parentFolder,
        }).sort({ name: 1 });

        res.status(200).json({
            success: true,
            folders,
        });
    } catch (error) {
        next(error);
    }
};

export const getContents = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId: string = req.userId!;
        const { encodedPath = "/", query = "", sort = "" } = req.query;
        let folderPath =
            typeof encodedPath === "string"
                ? decodeURIComponent(encodedPath)
                : "/";
        let searchQuery = typeof query === "string" ? query : "";
        let sortOrder = typeof sort === "string" ? sort : "";

        const mappings = {
            "/documents": ["document"],
            "/images": ["image"],
            "/media": ["video", "audio"],
            "/other": ["other"],
        };

        const types =
            Object.entries(mappings).find(([prefix]) =>
                folderPath.startsWith(prefix)
            )?.[1] || [];

        const isTrash = folderPath.startsWith("/trash");
        const isFavorite = folderPath.startsWith("/favorite");
        const isType = Object.keys(mappings).some((prefix) =>
            folderPath.startsWith(prefix)
        );
        const isShared = folderPath.startsWith("/shared");
        let email: string | undefined = "";

        if (isShared) {
            const user = await UserModel.findOne({
                _id: new mongoose.Types.ObjectId(accountId),
            });
            email = user?.email;
        }

        let actualFolderPath = folderPath;
        if (isTrash) {
            actualFolderPath = folderPath.replace(/^\/trash(\/|$)/, "/");
        } else if (isFavorite) {
            actualFolderPath = folderPath.replace(/^\/favorite(\/|$)/, "/");
        } else if (isShared) {
            actualFolderPath = folderPath.replace(/^\/shared(\/|$)/, "/");
        } else if (isType) {
            actualFolderPath = folderPath.replace(
                /^\/(documents|images|media|other)(\/|$)/,
                "/"
            );
        }

        if (actualFolderPath !== "/") {
            const folderExists = await Folder.findOne({
                path: actualFolderPath,
                accountId,
                isDeleted: isTrash,
            });

            if (!folderExists) {
                const errorMessage = isTrash
                    ? "Folder not found in trash!"
                    : "Parent folder not found!";
                throw createError(404, errorMessage);
            }
        }

        // Build filter based on whether we're in trash view or normal view
        const fileFilter = buildFilter(
            accountId,
            actualFolderPath,
            isTrash,
            isFavorite,
            true,
            isShared,
            types,
            searchQuery,
            email
        );

        // Determine sort options
        const defaultSort = isTrash ? "deletedAt-desc" : "name-asc";
        const sortOptions: Record<string, any> = buildSortOptions(
            sortOrder || defaultSort
        );

        // Get files
        const rawFiles = await File.find(fileFilter)
            .sort(sortOptions)
            .populate<{ accountId: User }>({
                path: "accountId",
                select: "name",
            });

        // Process files
        const files = rawFiles.map((file) => {
            const user = file.accountId;
            const fileObj = {
                ...file.toObject(),
                accountId: user._id,
                ownerFullName: user.name,
            };

            return fileObj;
        });

        let folders: any = [];

        // Get folders if not filtering by types
        if ((types.length === 0 && !isFavorite && !isShared) || isTrash) {
            const folderFilter = buildFilter(
                accountId,
                actualFolderPath,
                isTrash,
                false,
                false,
                isShared,
                types,
                searchQuery,
                email
            );

            folders = await Folder.find(folderFilter).sort(sortOptions);
        }

        const message = isTrash
            ? "Trash contents retrieved successfully"
            : isFavorite
            ? "Favorite files are successfully found!"
            : "Files and folders are successfully found!";

        res.status(200).json({
            success: true,
            message,
            folderPath,
            folders,
            files,
        });
    } catch (error) {
        next(error);
    }
};

export const getFolderDetails = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const { folderId } = req.params;
        const accountId: string = req.userId!;

        const matchFilter: any = {
            accountId: new mongoose.Types.ObjectId(accountId),
            isDeleted: false,
        };

        if (folderId !== "root") {
            const folder = await Folder.findOne({ _id: folderId, accountId });
            if (!folder) throw createError(404, "Folder not found!");

            matchFilter.folderPath = { $regex: `^${folder.path}(/|$)` };
        }

        const result = await File.aggregate([
            {
                $match: matchFilter,
            },
            {
                $group: {
                    _id: null,
                    totalSize: { $sum: "$size" },
                    fileCount: { $sum: 1 },
                },
            },
        ]);

        const totalSize = result[0]?.totalSize || 0;
        const fileCount = result[0]?.fileCount || 0;

        res.status(200).json({
            success: true,
            message: "Folder details successfully finded.",
            details: {
                totalSize,
                fileCount,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const renameFolder = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const { folderId } = req.params;
        const { newName } = req.body;
        const accountId: string = req.userId!;

        const folder = await Folder.findOne({
            _id: folderId,
            accountId,
        });

        if (!folder) throw createError(404, "Folder not found!");

        const oldPath = folder.path;
        const parentFolder = folder.parentFolder;

        // Check for name conflicts in the target parent
        const baseName = newName;
        let folderName = baseName;
        let counter = 1;
        let newPath =
            parentFolder === "/"
                ? `/${folderName}`
                : `${parentFolder}/${folderName}`;

        while (
            await Folder.findOne({
                accountId,
                path: newPath,
            })
        ) {
            folderName = `${baseName} (${counter})`;
            newPath =
                parentFolder === "/"
                    ? `/${folderName}`
                    : `${parentFolder}/${folderName}`;
            counter++;
        }

        folder.name = folderName;
        folder.path = newPath;
        await folder.save();

        const allSubfolders = await Folder.find({
            accountId,
            path: { $regex: `^${oldPath}/` },
        });

        for (const subfolder of allSubfolders) {
            subfolder.path = subfolder.path.replace(oldPath, newPath);
            subfolder.parentFolder = subfolder.parentFolder.replace(
                oldPath,
                newPath
            );
            await subfolder.save();
        }

        await File.updateMany(
            { accountId, folderPath: oldPath },
            { $set: { folderPath: newPath } }
        );

        await File.updateMany(
            { accountId, folderPath: { $regex: `^${oldPath}/` } },
            [
                {
                    $set: {
                        folderPath: {
                            $replaceAll: {
                                input: "$folderPath",
                                find: oldPath,
                                replacement: newPath,
                            },
                        },
                    },
                },
            ]
        );

        await Log.create({
            accountId,
            action: "rename",
            targetName: folderName,
            targetType: TARGET_TYPE,
            targetMessage: newName,
        });

        res.status(200).json({
            success: true,
            message: "Folder successfully renamed.",
            folder,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteFolder = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const { folderId } = req.params;
        const accountId: string = req.userId!;
        const { permament = false } = req.query;

        const folder = await Folder.findOne({
            _id: folderId,
            accountId,
        });

        if (!folder) throw createError(404, "Folder not found!");

        const folderPath = folder.path;
        const parentFolder = folder.parentFolder;
        const isPermanent = permament || folder.isDeleted;

        if (isPermanent) {
            const files = await File.find({
                accountId,
                $or: [
                    { folderPath },
                    { folderPath: { $regex: `^${folderPath}/` } },
                ],
            });

            // Delete files from disk
            for (const file of files) {
                const filePath = path.join(
                    __dirname,
                    "..",
                    "..",
                    "uploads",
                    accountId,
                    file.storageName
                );

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            await Folder.deleteMany({
                accountId,
                $or: [
                    { path: folderPath },
                    { path: { $regex: `^${folderPath}/` } },
                ],
            });

            await File.deleteMany({
                accountId,
                $or: [
                    { folderPath },
                    { folderPath: { $regex: `^${folderPath}/` } },
                ],
            });
        } else {
            // Move folder to trash
            const now = new Date();

            // Mark the main folder as deleted
            folder.isDeleted = true;
            folder.deletedAt = now;
            folder.originalPath = folder.path; // Store the original path
            folder.parentFolder = "/";
            folder.path = `/${folder.name}`;
            await folder.save();

            const folders = await Folder.find({
                accountId,
                path: { $regex: `^${folderPath}/` },
            });

            for (const subfolder of folders) {
                subfolder.isDeleted = true;
                subfolder.deletedAt = now;
                subfolder.originalPath = subfolder.path;

                subfolder.path =
                    parentFolder === "/"
                        ? subfolder.path
                        : subfolder.path.replace(parentFolder, "");
                subfolder.parentFolder = getParentFolderFromPath(
                    subfolder.path
                );
                await subfolder.save();
            }

            const files = await File.find({
                accountId,
                $or: [
                    { folderPath },
                    { folderPath: { $regex: `^${folderPath}/` } },
                ],
            });

            for (const file of files) {
                file.isDeleted = true;
                file.deletedAt = now;
                file.originalPath = file.folderPath;
                file.folderPath =
                    parentFolder === "/"
                        ? file.folderPath
                        : file.folderPath.replace(parentFolder, "");
                await file.save();
            }
        }

        await Log.create({
            accountId,
            action: "delete",
            targetName: folder.name,
            targetType: TARGET_TYPE,
            targetMessage: isPermanent ? "permanent" : "soft",
        });

        res.status(200).json({
            success: true,
            message: "Folder successfully deleted.",
        });
    } catch (error) {
        next(error);
    }
};

export const moveFolder = async (req: RequestWithUserId, res: Response) => {
    try {
        const { folderId } = req.params;
        const { destinationFolder } = req.body;
        const accountId: string = req.userId!;

        const folder = await Folder.findOne({
            _id: folderId,
            accountId,
        });

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: "Папка не знайдена",
            });
        }

        // Перевіряємо чи існує папка призначення
        if (destinationFolder !== "/") {
            const destFolder = await Folder.findOne({
                path: destinationFolder,
                accountId,
            });

            if (!destFolder) {
                return res.status(404).json({
                    success: false,
                    message: "Папка призначення не знайдена",
                });
            }
        }

        // Перевіряємо, що цільова папка не є підпапкою папки що переміщується
        if (destinationFolder.startsWith(folder.path + "/")) {
            return res.status(400).json({
                success: false,
                message: "Не можна перемістити папку в її власну підпапку",
            });
        }

        const oldPath = folder.path;
        const folderName = folder.name;
        const newPath =
            destinationFolder === "/"
                ? `/${folderName}`
                : `${destinationFolder}/${folderName}`;

        // Перевіряємо чи не існує папки з таким шляхом в цільовій папці
        const folderExists = await Folder.findOne({
            path: newPath,
            accountId,
        });

        if (folderExists && (folderExists._id as string) !== folderId) {
            return res.status(400).json({
                success: false,
                message: "Папка з таким ім'ям вже існує в папці призначення",
            });
        }

        // Оновлюємо шлях папки
        folder.path = newPath;
        folder.parentFolder = destinationFolder;
        await folder.save();

        // Оновлюємо шляхи всіх вкладених папок
        const allSubfolders = await Folder.find({
            accountId,
            path: { $regex: `^${oldPath}/` },
        });

        for (const subfolder of allSubfolders) {
            subfolder.path = subfolder.path.replace(oldPath, newPath);
            if (subfolder.parentFolder === oldPath) {
                subfolder.parentFolder = newPath;
            }
            await subfolder.save();
        }

        // Оновлюємо folderPath у файлах
        await File.updateMany(
            { accountId, folderPath: oldPath },
            { $set: { folderPath: newPath } }
        );

        await File.updateMany(
            { accountId, folderPath: { $regex: `^${oldPath}/` } },
            [
                {
                    $set: {
                        folderPath: {
                            $replaceAll: {
                                input: "$folderPath",
                                find: oldPath,
                                replacement: newPath,
                            },
                        },
                    },
                },
            ]
        );
        res.status(200).json({
            success: true,
            folder,
        });
    } catch (error) {
        console.error("Помилка переміщення папки:", error);
        res.status(500).json({
            success: false,
            message: "Помилка сервера при переміщенні папки",
        });
    }
};

export const downloadFolderAsZip = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const { folderId } = req.params;
        const accountId: string = req.userId!;

        const mainFolder = await Folder.findOne({
            _id: folderId,
            accountId,
        });
        if (!mainFolder) throw createError(404, "Folder not found!");

        const allFolders = await getAllSubfolders(folderId);

        const archive = archiver("zip", {
            zlib: { level: 9 },
        });

        archive.on("error", () => {
            throw createError(500, "Error in making zip file!");
        });

        res.setHeader("Content-Type", "application/zip");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${mainFolder.name}.zip"`
        );

        archive.pipe(res);

        const tempDir = path.join(
            process.cwd(),
            "temp",
            `download-${Date.now()}`
        );
        fs.mkdirSync(tempDir, { recursive: true });

        try {
            for (const folder of allFolders) {
                const relativePath =
                    folder.path === mainFolder.path
                        ? "/"
                        : folder.path.replace(mainFolder.path, "");

                if (relativePath !== "/") {
                    archive.append(Buffer.alloc(0), {
                        name: relativePath.substring(1) + "/",
                    });
                }

                const files = await File.find({ folderPath: folder.path });

                for (const file of files) {
                    const fileRelativePath =
                        file.folderPath === mainFolder.path
                            ? file.name
                            : file.folderPath
                                  .replace(mainFolder.path, "")
                                  .substring(1) +
                              "/" +
                              file.name;

                    const filePath = path.join(
                        __dirname,
                        "..",
                        "..",
                        "uploads",
                        accountId,
                        file.storageName
                    );

                    archive.file(filePath, { name: fileRelativePath });
                }
            }

            await archive.finalize();
        } finally {
            setTimeout(() => {
                fs.rm(tempDir, { recursive: true, force: true }, (err) => {
                    console.error(err);
                });
            }, 1000);
        }

        await Log.create({
            accountId,
            action: "download",
            targetName: mainFolder.name,
            targetType: TARGET_TYPE,
            targetMessage: "zip",
        });
    } catch (error) {
        next(error);
    }
};

export const restoreFolder = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const { folderId } = req.params;
        const accountId: string = req.userId!;

        const folder = await Folder.findOne({
            _id: folderId,
            accountId,
            isDeleted: true,
        });

        if (!folder) throw createError(404, "Folder not found in trash!");

        // Check if original parent folder still exists
        const originalParent = getParentFolderFromPath(folder.originalPath);
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
        let path = folder.originalPath || "/";

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

        const subfolders = await getAllSubfolders(folderId);
        subfolders.shift();

        // Update folder
        const oldPath = folder.originalPath;
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
            file.folderPath = file.originalPath || "/";
            file.originalPath = undefined;
            file.deletedAt = undefined;
            await file.save();
        }

        // Restore all subfolders
        for (const subfolder of subfolders) {
            subfolder.isDeleted = false;
            subfolder.deletedAt = undefined;
            subfolder.path = subfolder.originalPath || "/";
            subfolder.parentFolder = getParentFolderFromPath(subfolder.path);
            subfolder.originalPath = undefined;

            await subfolder.save();
        }

        await Log.create({
            accountId,
            action: "restore",
            targetName: folder.name,
            targetType: TARGET_TYPE,
            targetMessage: "",
        });

        res.status(200).json({
            success: true,
            message: "Folder successfully restored!",
        });
    } catch (error) {
        next(error);
    }
};
