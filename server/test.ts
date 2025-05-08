const path = "/documents";

const mappings = {
    "/documents": ["document"],
    "/images": ["image"],
    "/media": ["video", "audio"],
    "/other": ["other"],
};

const types =
    Object.entries(mappings).find(([prefix]) => path.startsWith(prefix))?.[1] ||
    [];

console.log(types);
