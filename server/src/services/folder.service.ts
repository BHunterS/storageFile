import path from "path";
import fs from "fs";

import Folder from "../models/folder.model";
import File from "../models/file.model";
import Log from "../models/log.model";

import { createError } from "../utils/createError";
import { getParentFolderFromPath } from "../utils/helpers";

import { IFolder, Scope } from "types";

const TARGET_TYPE = "folder";

const buildPath = (parentFolder: string, name: string): string =>
    parentFolder === "/" ? `/${name}` : `${parentFolder}/${name}`;

const uniqueNameAndPath = async (
    scope: Scope,
    name: string,
    parentFolder: string = "/"
) => {
    let folderName = name;
    let path = buildPath(parentFolder, folderName);
    let counter = 1;

    while (await Folder.findOne({ path, ...scope })) {
        const baseName = name.replace(/\(\d+\)$/, "");
        folderName = `${baseName} (${counter})`;
        path = buildPath(parentFolder, folderName);
        counter++;
    }

    return { folderName, path };
};

export const createNewFolder = async (
    accountId: string,
    name: string,
    parentFolder: string = "/",
    scope: Scope
) => {
    if (parentFolder !== "/") {
        const parentFolderExists = await Folder.findOne({
            path: parentFolder,
            ...scope,
        });

        if (!parentFolderExists)
            throw createError(404, "Parent folder not found!");
    }

    const { folderName, path } = await uniqueNameAndPath(
        scope,
        name,
        parentFolder
    );

    const folder = new Folder({
        name: folderName,
        path,
        parentFolder,
        accountId,
        spaceId: scope.spaceId,
    });

    await folder.save();

    await Log.create({
        accountId,
        action: "create",
        targetName: folderName,
        targetType: TARGET_TYPE,
        targetMessage: parentFolder,
    });

    return folder;
};

export const getFolderDetails = async (matchFilter: Record<string, any>) => {
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

    return { totalSize, fileCount };
};

export const renameFolder = async (
    folder: IFolder,
    newName: string,
    scope: Scope
) => {
    const oldPath = folder.path;
    const oldName = folder.name;
    const parentFolder = folder.parentFolder;

    const { folderName, path } = await uniqueNameAndPath(
        scope,
        newName,
        parentFolder
    );

    folder.name = folderName;
    folder.path = path;
    await folder.save();

    const allSubfolders = await Folder.find({
        path: { $regex: `^${oldPath}/` },
        ...scope,
    });

    for (const subfolder of allSubfolders) {
        subfolder.path = subfolder.path.replace(oldPath, path);
        subfolder.parentFolder = subfolder.parentFolder.replace(oldPath, path);
        await subfolder.save();
    }

    await File.updateMany(
        { folderPath: oldPath, ...scope },
        { $set: { folderPath: path } }
    );

    await File.updateMany(
        { folderPath: { $regex: `^${oldPath}/` }, ...scope },
        [
            {
                $set: {
                    folderPath: {
                        $replaceAll: {
                            input: "$folderPath",
                            find: oldPath,
                            replacement: path,
                        },
                    },
                },
            },
        ]
    );

    return folder;
};

export const deleteFolder = async (
    folder: IFolder,
    isPermanent: boolean,
    scope: Scope
) => {
    const folderPath = folder.path;
    const parentFolder = folder.parentFolder;

    if (isPermanent) {
        const files = await File.find({
            ...scope,
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
                file.accountId.toString(),
                file.storageName
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await Folder.deleteMany({
            ...scope,
            $or: [
                { path: folderPath },
                { path: { $regex: `^${folderPath}/` } },
            ],
        });

        await File.deleteMany({
            ...scope,
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
            ...scope,
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
            subfolder.parentFolder = getParentFolderFromPath(subfolder.path);
            await subfolder.save();
        }

        const files = await File.find({
            ...scope,
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
};

export const restoreFolder = async (folder: IFolder, scope: Scope) => {
    // Check if original parent folder still exists
    const originalParent = getParentFolderFromPath(folder.originalPath);
    let targetParent = originalParent;

    if (
        originalParent !== "/" &&
        !(await Folder.findOne({
            path: originalParent,
            isDeleted: false,
            ...scope,
        }))
    ) {
        // If original parent doesn't exist, move to root
        targetParent = "/";
    }

    const { folderName, path } = await uniqueNameAndPath(
        scope,
        folder.name,
        folder.path
    );

    // const subfolders = await getAllSubfolders(folderId);
    const subfolders = await Folder.find({
        path: { $regex: `^${folder.path}/` },
        ...scope,
    });

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
        isDeleted: true,
        originalPath: { $regex: `^${oldPath}(/|$)` },
        ...scope,
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
};
