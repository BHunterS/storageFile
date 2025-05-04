import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useQueryParams = () => {
    const location = useLocation();
    const [type, setType] = useState("");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setType(params.get("types") || "");
        setQuery(params.get("query") || "");
        setSort(params.get("sort") || "");
    }, [location]);

    return { type, query, sort };
};
