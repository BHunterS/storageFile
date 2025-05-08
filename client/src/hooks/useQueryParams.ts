import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useQueryParams = () => {
    const location = useLocation();
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setQuery(params.get("query") || "");
        setSort(params.get("sort") || "");
    }, [location]);

    return { query, sort };
};
