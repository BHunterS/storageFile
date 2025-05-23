import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useNavigate, useLocation } from "react-router-dom";
import { sortTypes } from "@/constants";

const Sort = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;

    const handleSort = (value: string) => {
        navigate(`${path}?sort=${value}`);
    };

    return (
        <Select onValueChange={handleSort} defaultValue={sortTypes[0].value}>
            <SelectTrigger className="sort-select">
                <SelectValue placeholder={sortTypes[0].value} />
            </SelectTrigger>
            <SelectContent className="sort-select-content">
                {sortTypes.map((sort) => (
                    <SelectItem
                        key={sort.label}
                        className="shad-select-item"
                        value={sort.value}
                    >
                        {sort.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default Sort;
