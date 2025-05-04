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

    if (!sort) return defaultSort;

    const [field, direction] = sort.split("-");
    const validFields: string[] = ["name", "size", "createdAt"];
    const validDirections: string[] = ["asc", "desc"];

    console.log(field, direction);

    if (!validFields.includes(field) || !validDirections.includes(direction)) {
        return defaultSort;
    }

    console.log({ [field]: direction === "asc" ? 1 : -1 });

    return { [field]: direction === "asc" ? 1 : -1 };
};
