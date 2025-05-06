export const buildFileFilter = (
    accountId: string | undefined,
    folderPath: string,
    types?: string[],
    name?: string
) => {
    const filter: Record<string, any> = { accountId, folderPath };

    if (types?.length) {
        filter.type = { $in: types };
    }

    if (name) {
        filter.name = { $regex: name, $options: "i" };
    }

    return filter;
};

export const buildSortOptions = (sort?: string): Record<string, 1 | -1> => {
    const defaultSort: Record<string, 1 | -1> = { name: 1 };
    console.log(sort);

    if (!sort) return defaultSort;

    const [field, direction] = sort.split("-");
    const validFields: string[] = ["name", "size", "createdAt", "deletedAt"];
    const validDirections: string[] = ["asc", "desc"];

    console.log(field, direction);

    if (!validFields.includes(field) || !validDirections.includes(direction)) {
        return defaultSort;
    }

    console.log({ [field]: direction === "asc" ? 1 : -1 });

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
