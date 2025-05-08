import { createError } from "./createError";

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
    accountId: string,
    folderPath: string,
    isDeleted: boolean,
    isFavorite: boolean,
    isFile: boolean,
    types: string[],
    query?: string
) => {
    return {
        accountId,
        isDeleted,
        ...(!isFavorite &&
            types.length === 0 && {
                [isFile ? "folderPath" : "parentFolder"]: folderPath,
            }),
        ...(query && { name: { $regex: query, $options: "i" } }),
        ...(isFile &&
            types.length !== 0 &&
            !isDeleted && { type: { $in: types } }),
        ...(isFavorite && { isFavorite }),
    };
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
