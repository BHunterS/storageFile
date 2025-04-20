import { NextFunction, Response } from "express";

import Folder from "../models/folder.model";
import File from "../models/file.model";

import { createError } from "../utils/createError";

import { RequestWithUserId } from "types";

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

        const path =
            parentFolder === "/" ? `/${name}` : `${parentFolder}/${name}`;

        const folderExists = await Folder.findOne({ path, accountId });
        if (folderExists)
            throw createError(400, "Folder with that name already exists!");

        const folder = new Folder({
            name,
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
        const { folderPath = "/" } = req.body;

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

        const files = await File.find({
            accountId,
            folderPath,
        }).sort({ name: 1 });

        res.status(200).json({
            success: true,
            folderPath,
            folders,
            files,
        });
    } catch (error) {
        next(error);
    }
};

export const renameFolder = async (req: RequestWithUserId, res: Response) => {
    try {
        const { folderId } = req.params;
        const { newName } = req.body;
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

        // Формуємо новий шлях
        const oldPath = folder.path;
        const oldName = folder.name;
        const parentFolder = folder.parentFolder;

        const newPath =
            parentFolder === "/" ? `/${newName}` : `${parentFolder}/${newName}`;

        // Перевіряємо чи не існує папки з таким новим шляхом
        const folderExists = await Folder.findOne({
            path: newPath,
            accountId,
        });

        if (folderExists && folderExists._id.toString() !== folderId) {
            return res.status(400).json({
                success: false,
                message: "Папка з таким ім'ям вже існує в цьому місці",
            });
        }

        // Оновлюємо шлях цієї папки
        folder.name = newName;
        folder.path = newPath;
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
        console.error("Помилка перейменування папки:", error);
        res.status(500).json({
            success: false,
            message: "Помилка сервера при перейменуванні папки",
        });
    }
};

export const deleteFolder = async (req: RequestWithUserId, res: Response) => {
    try {
        const { folderId } = req.params;
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

        const folderPath = folder.path;

        // Видаляємо всі вкладені папки
        await Folder.deleteMany({
            accountId,
            $or: [
                { path: folderPath },
                { path: { $regex: `^${folderPath}/` } },
            ],
        });

        // Видаляємо всі файли в цій папці та підпапках
        await File.deleteMany({
            accountId,
            $or: [
                { folderPath },
                { folderPath: { $regex: `^${folderPath}/` } },
            ],
        });

        res.status(200).json({
            success: true,
            message: "Папка та всі її вміст успішно видалені",
        });
    } catch (error) {
        console.error("Помилка видалення папки:", error);
        res.status(500).json({
            success: false,
            message: "Помилка сервера при видаленні папки",
        });
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
