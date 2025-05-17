import mongoose, { mongo } from "mongoose";

import { createError } from "./createError";
import { Scope } from "types";

// export const buildFileFilter = (
//     accountId: string | undefined,
//     folderPath: string,
//     types?: string[],
//     name?: string
// ) => {
//     const filter: Record<string, any> = { accountId, folderPath };

//     if (types?.length) {
//         filter.type = { $in: types };
//     }

//     if (name) {
//         filter.name = { $regex: name, $options: "i" };
//     }

//     return filter;
// };

export const buildFilter = (
    scope: Scope,
    folderPath: string,
    isDeleted: boolean,
    isFavorite: boolean,
    isFile: boolean,
    isShared: boolean,
    types: string[],
    query?: string,
    email?: string
) => {
    const filter: Record<string, any> = { isDeleted, spaceId: scope.spaceId };
    const hasNoTypes = types.length === 0;
    const isSearchingByTypes = isFile && !hasNoTypes && !isDeleted;
    const isFilteringByPath = !isShared && !isFavorite && hasNoTypes;

    if (isShared) {
        filter.users = email;
    } else {
        if (scope.accountId) {
            filter.accountId = scope.accountId;
        }
    }

    if (isFilteringByPath) {
        filter[isFile ? "folderPath" : "parentFolder"] = folderPath;
    }

    if (query) {
        filter.name = { $regex: query, $options: "i" };
    }

    if (isSearchingByTypes) {
        filter.type = { $in: types };
    }

    if (isFavorite) {
        filter.isFavorite = isFavorite;
    }

    return filter;
};

export const buildSortOptions = (sort: string): Record<string, 1 | -1> => {
    const [field, direction] = sort.split("-");
    const validFields = ["name", "size", "createdAt", "deletedAt"];
    const validDirections = ["asc", "desc"];

    if (!validFields.includes(field) || !validDirections.includes(direction))
        throw createError(400, "Invalid sort parameters");

    return { [field]: direction === "asc" ? 1 : -1 };
};

export const calculateDaysLeft = (deletedAt: Date | undefined): number => {
    if (!deletedAt) return 30;

    const currentDate = new Date();
    const deleteDate = new Date(deletedAt);
    const thirtyDaysLater = new Date(deleteDate);
    thirtyDaysLater.setDate(deleteDate.getDate() + 30);

    const daysLeft = Math.ceil(
        (thirtyDaysLater.getTime() - currentDate.getTime()) /
            (1000 * 60 * 60 * 24)
    );
    return Math.max(0, daysLeft);
};

export const getParentFolderFromPath = (path: string | undefined): string => {
    if (path) {
        const lastSlashIndex = path.lastIndexOf("/");
        if (lastSlashIndex <= 0) return "/";
        return path.substring(0, lastSlashIndex);
    }

    return "/";
};

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return emailRegex.test(email);
};
