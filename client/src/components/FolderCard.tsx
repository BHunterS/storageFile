import { Folder, FolderCheck } from "lucide-react";

import ItemCard from "./ItemCard";

import { Folder as folder } from "@/types";

interface Props {
    folder: folder;
    isSelected: boolean;
    onClick: () => void;
    onDoubleClick: () => void;
}

const FolderCard = ({ folder, isSelected, onClick, onDoubleClick }: Props) => {
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
                        {isSelected ? (
                            <FolderCheck className="size-24 text-sky-700" />
                        ) : (
                            <Folder className="size-24 text-[#ffc800]" />
                        )}
                    </div>
                }
            />
        </div>
    );
};

export default FolderCard;
