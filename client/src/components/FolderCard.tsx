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
            className={`file-card relative cursor-pointer ${
                isSelected
                    ? "after:absolute after:inset-0 after:rounded-xl after:bg-sky-500/20"
                    : ""
            }`}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
        >
            <ItemCard
                item={folder}
                leftContent={
                    <div className="flex items-center space-x-2">
                        {isSelected ? (
                            <FolderCheck className="size-20 text-sky-700 transition-transform duration-200" />
                        ) : (
                            <Folder className="size-20 text-yellow-400 transition-transform duration-200" />
                        )}
                    </div>
                }
            />
        </div>
    );
};

export default FolderCard;
