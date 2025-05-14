export const SERVER_URL = "http://localhost:5000";

export const sortTypes = [
    {
        label: "Date created (newest)",
        value: "createdAt-desc",
    },
    {
        label: "Created Date (oldest)",
        value: "createdAt-asc",
    },
    {
        label: "Name (A-Z)",
        value: "name-asc",
    },
    {
        label: "Name (Z-A)",
        value: "name-desc",
    },
    {
        label: "Size (Highest)",
        value: "size-desc",
    },
    {
        label: "Size (Lowest)",
        value: "size-asc",
    },
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
