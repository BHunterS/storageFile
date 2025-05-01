import { Folder } from "lucide-react";

import ItemCard from "./ItemCard";

import { Folder as folder } from "@/types";

interface Props {
    folder: folder;
    onClick: () => void;
    onDoubleClick: () => void;
}

const FolderCard = ({ folder, onClick, onDoubleClick }: Props) => {
    return (
        <div
            className="file-card"
            onClick={onClick}
            onDoubleClick={onDoubleClick}
        >
            <ItemCard
                item={folder}
                leftContent={
                    <div className="flex items-center space-x-2">
                        <Folder className="size-24 text-yellow-700" />
                    </div>
                }
            />
        </div>
    );
};

export default FolderCard;
