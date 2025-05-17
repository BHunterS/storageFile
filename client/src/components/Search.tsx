import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Search as SearchIcon } from "lucide-react";

import { useDebounce } from "@/hooks/useDebounce";

import { SERVER_URL } from "@/constants";

import { Input } from "./ui/input";

import FormattedDateTime from "./FormattedDateTime";
import Thumbnail from "./Thumbnail";

import { SFile } from "@/types";

const Search = ({ files }: { files: SFile[] }) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const debouncedQuery = useDebounce(query, 500);

    const handleClickItem = (file: SFile) => {
        window.open(`${SERVER_URL}/api/files/${file._id}`, "_blank");
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const isQuery = debouncedQuery.length > 0;

        if (isQuery) {
            params.set("query", debouncedQuery);
        } else {
            params.delete("query");
        }
        navigate(`${location.pathname}?${params.toString()}`, {
            replace: true,
        });
        setOpen(isQuery);
    }, [location.pathname, location.search, navigate, debouncedQuery]);

    return (
        <div className="search">
            <div className="search-input-wrapper">
                <SearchIcon size={24} aria-label="Search" />
                <Input
                    value={query}
                    placeholder="Search..."
                    className="search-input"
                    onChange={(e) => setQuery(e.target.value)}
                />

                {open && (
                    <ul className="search-result">
                        {files.length > 0 ? (
                            files.map((file) => (
                                <li
                                    className="flex items-center justify-between"
                                    key={file._id}
                                    onClick={() => handleClickItem(file)}
                                >
                                    <div className="flex cursor-pointer items-center gap-4">
                                        <Thumbnail
                                            type={file.type}
                                            extension={file.extension}
                                            url={`${file.url}${file._id}?spaceId=personal`}
                                            className="size-9 min-w-9"
                                        />
                                        <p className="subtitle-2 line-clamp-1 text-light-100">
                                            {file.name}
                                        </p>
                                    </div>

                                    <FormattedDateTime
                                        date={file.createdAt}
                                        className="caption line-clamp-1 text-light-200"
                                    />
                                </li>
                            ))
                        ) : (
                            <p className="empty-result">No files found</p>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Search;
