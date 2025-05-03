import { NextFunction, Response } from "express";

import Folder from "../models/folder.model";
import File from "../models/file.model";

import { createError } from "../utils/createError";

import { RequestWithUserId, User } from "types";
import { buildFileFilter, buildSortOptions } from "../utils/helpers";

export const createFolder = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, parentFolder = "/" } = req.body;
        const accountId = req.userId;

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
        const accountId = req.userId;
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

export const getFolderContents = async (
    req: RequestWithUserId,
    res: Response,
    next: NextFunction
) => {
    try {
        const accountId = req.userId;
        const { encodedPath = "/", types, query, sort } = req.body;
        const folderPath = decodeURIComponent(encodedPath);

        if (folderPath !== "/") {
            const folderExists = await Folder.findOne({
                path: folderPath,
                accountId,
            });

            if (!folderExists)
                throw createError(404, "Parent folder not found!");
        }

        const folders = await Folder.find({
            accountId,
            parentFolder: folderPath,
        }).sort({ name: 1 });

        const filter: Record<string, any> = buildFileFilter(
            accountId,
            folderPath,
            types,
            query
        );
        const sortOptions: Record<string, 1 | -1> = buildSortOptions(sort);

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
            };
        });

        res.status(200).json({
            success: true,
            message: "Files and folders are successfully found!",
            folderPath,
            folders,
            files,
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
        const accountId = req.userId;

        const folder = await Folder.findOne({
            _id: folderId,
            accountId,
        });

        if (!folder) throw createError(404, "Folder not found!");

        // Формуємо новий шлях
        const oldPath = folder.path;
        const oldName = folder.name;
        const parentFolder = folder.parentFolder;

        const newPath =
            parentFolder === "/" ? `/${newName}` : `${parentFolder}/${newName}`;

        const folderExists = await Folder.findOne({
            path: newPath,
            accountId,
        });

        // TODO should be Folder (1) and so on
        if (folderExists && folderExists._id.toString() !== folderId) {
            throw createError(400, "Folder with this name already exists!");
        }

        folder.name = newName;
        folder.path = newPath;
        await folder.save();

        const allSubfolders = await Folder.find({
            accountId,
            path: { $regex: `^${oldPath}/` },
        });

        console.log(allSubfolders);

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
        const accountId = req.userId;

        const folder = await Folder.findOne({
            _id: folderId,
            accountId,
        });

        if (!folder) throw createError(404, "Folder not found!");

        const folderPath = folder.path;

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
        const accountId = req.userId;

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

        if (folderExists && folderExists._id.toString() !== folderId) {
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
