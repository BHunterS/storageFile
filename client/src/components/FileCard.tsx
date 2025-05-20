import { Link } from "react-router-dom";

import { useSpaceStore } from "@/store/spaceStore";

import ItemCard from "./ItemCard";
import Thumbnail from "./Thumbnail";

import { SFile } from "@/types";

const FileCard = ({ file }: { file: SFile }) => {
    const { currentSpace } = useSpaceStore();

    return (
        <Link
            to={`${file.url}${file._id}?spaceId=${currentSpace}`}
            target="_blank"
            className="file-card"
        >
            <ItemCard
                item={file}
                leftContent={
                    <Thumbnail
                        type={file.type}
                        extension={file.extension}
                        url={`${file.url}${file._id}?spaceId=${currentSpace}`}
                        className="!size-20"
                        imageClassName="!size-11"
                    />
                }
                bottomContent={
                    <p className="caption line-clamp-1 text-light-200">
                        By: {file.ownerFullName}
                    </p>
                }
            />
        </Link>
    );
};

export default FileCard;
