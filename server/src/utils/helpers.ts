export const buildFileFilter = (
    accountId: string,
    types?: string[],
    name?: string
) => {
    const filter: Record<string, any> = { accountId };

    if (types?.length) {
        filter.type = { $in: types };
    }

    if (name) {
        filter.name = { $regex: name, $options: "i" };
    }

    return filter;
};

export const buildSortOptions = (
    sort?: string
): Record<string, 1 | -1> | null => {
    if (!sort) return null;

    const [field, direction] = sort.split("-");
    const validFields: string[] = ["name", "size", "createdAt"];
    const validDirections: string[] = ["asc", "desc"];

    if (!validFields.includes(field) || !validDirections.includes(direction)) {
        return null;
    }

    return { [field]: direction === "asc" ? 1 : -1 };
};
