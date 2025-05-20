import { useState, useEffect } from "react";

import { useUploadStore } from "@/store/uploadStore";
import { useSpaceStore } from "@/store/spaceStore";

import { getMySpaces } from "@/api/space";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Space } from "@/types";

const LOCAL_STORAGE_KEY = "spaceId";

const Spaces = () => {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const { toggleTrigger } = useUploadStore();
    const { currentSpace, setCurrentSpace } = useSpaceStore();

    const handleChangeSpace = (value: string) => {
        setCurrentSpace(value);
        localStorage.setItem(LOCAL_STORAGE_KEY, value);
        toggleTrigger();
    };

    useEffect(() => {
        const fetchSpaces = async () => {
            try {
                const response = await getMySpaces();
                setSpaces(response.spaces || []);
            } catch (error) {
                console.error("Failed to fetch spaces:", error);
            }
        };

        const savedSpace = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedSpace) {
            setCurrentSpace(savedSpace);
        }

        fetchSpaces();
    }, [setCurrentSpace]);

    return (
        <Select onValueChange={handleChangeSpace} value={currentSpace}>
            <SelectTrigger className="sort-select">
                <SelectValue placeholder="Select space" />
            </SelectTrigger>
            <SelectContent className="sort-select-content">
                <SelectItem value="personal">Personal</SelectItem>
                {spaces.map((space) => (
                    <SelectItem
                        className="shad-select-item"
                        key={space._id}
                        value={space._id}
                    >
                        {space.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default Spaces;
