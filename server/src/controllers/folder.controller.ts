import { NextFunction, Response } from "express";
import mongoose from "mongoose";
import archiver from "archiver";
import path from "path";
import fs from "fs";

import Folder from "../models/folder.model";
import File from "../models/file.model";
import Log from "../models/log.model";
import UserModel from "../models/user.model";

import {
    createNewFolder,
    deleteFolder,
    getFolderDetails,
    renameFolder,
    restoreFolder,
} from "../services/folder.service";

import { createError } from "../utils/createError";

import { RequestWithScope, RequestWithUserId, User } from "types";
import { buildFilter, buildSortOptions } from "../utils/helpers";

const TARGET_TYPE = "folder";

export const handleCreateNewFolder = async (
    req: RequestWithScope,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, parentFolder = "/" } = req.body;
        const accountId: string = req.userId!;
        const scope = req.scope!;

        const folder = await createNewFolder(
            accountId,
            name,
            parentFolder,
            scope
        );

        res.status(201).json({
            success: true,
            message: "Folder successfully created!",
            folder,
        });
    } catch (error) {
        next(error);
    }
};

export const handleGetContent = async (
    req: RequestWithScope,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId: string = req.userId!;
        const scope = req.scope!;
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
                isDeleted: isTrash,
                ...scope,
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
            scope,
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
                scope,
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

export const handleGetFolderDetails = async (
    req: RequestWithScope,
    res: Response,
    next: NextFunction
) => {
    try {
        const { folderId } = req.params;
        const scope = req.scope!;

        const matchFilter: Record<string, any> = {
            isDeleted: false,
            spaceId: scope.spaceId,
            ...(scope.accountId && {
                accountId: new mongoose.Types.ObjectId(scope.accountId),
            }),
        };

        if (folderId !== "root") {
            const folder = await Folder.findOne({ _id: folderId, ...scope });
            if (!folder) throw createError(404, "Folder not found!");

            matchFilter.folderPath = { $regex: `^${folder.path}(/|$)` };
        }

        const { totalSize, fileCount } = await getFolderDetails(matchFilter);

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

export const handleRenameFolder = async (
    req: RequestWithScope,
    res: Response,
    next: NextFunction
) => {
    try {
        const { folderId } = req.params;
        const { newName } = req.body;
        const scope = req.scope!;
        const accountId = req.userId!;

        const mainFolder = await Folder.findOne({
            _id: folderId,
            ...scope,
        });

        if (!mainFolder) throw createError(404, "Folder not found!");

        const folder = await renameFolder(mainFolder, newName, scope);

        await Log.create({
            accountId,
            action: "rename",
            targetName: mainFolder.name,
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

export const handleDeleteFolder = async (
    req: RequestWithScope,
    res: Response,
    next: NextFunction
) => {
    try {
        const { folderId } = req.params;
        const accountId: string = req.userId!;
        const permament = req.query.permament;
        const scope = req.scope!;

        const folder = await Folder.findOne({
            _id: folderId,
            ...scope,
        });

        if (!folder) throw createError(404, "Folder not found!");

        const isPermanent = Boolean(permament) || folder.isDeleted;

        await deleteFolder(folder, isPermanent, scope);

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

export const handleDownloadFolderAsZip = async (
    req: RequestWithScope,
    res: Response,
    next: NextFunction
) => {
    try {
        const { folderId } = req.params;
        const accountId: string = req.userId!;
        const scope = req.scope!;

        const mainFolder = await Folder.findOne({
            _id: folderId,
            ...scope,
        });
        if (!mainFolder) throw createError(404, "Folder not found!");

        const allFolders = await Folder.find({
            path: { $regex: `^${mainFolder.path}/` },
            ...scope,
        });

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

export const handleRestoreFolder = async (
    req: RequestWithScope,
    res: Response,
    next: NextFunction
) => {
    try {
        const { folderId } = req.params;
        const accountId: string = req.userId!;
        const scope = req.scope!;

        const folder = await Folder.findOne({
            _id: folderId,
            isDeleted: true,
            ...scope,
        });

        if (!folder) throw createError(404, "Folder not found");

        await restoreFolder(folder, scope);

        if (!folder) throw createError(404, "Folder not found in trash!");

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
