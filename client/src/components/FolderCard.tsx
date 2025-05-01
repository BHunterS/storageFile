import FormattedDateTime from "./FormattedDateTime";
import { Folder as folder } from "@/types";
import { Folder } from "lucide-react";

const FolderCard = ({
    folder,
    onClick,
    onContextMenu,
}: {
    folder: folder;
    onClick: () => void;
    onContextMenu?: (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => void;
}) => {
    return (
        <div
            className="file-card"
            onClick={onClick}
            onContextMenu={onContextMenu}
        >
            <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                    <Folder className="size-24 text-yellow-700" />
                </div>

                <div className="flex flex-col items-end justify-between">
                    ...
                </div>
            </div>

            <div className="folder-card-details">
                <p className="subtitle-2 line-clamp-1">{folder.name}</p>
                <FormattedDateTime
                    date={folder.createdAt}
                    className="body-2 text-light-100"
                />
            </div>
        </div>
    );
};

export default FolderCard;
