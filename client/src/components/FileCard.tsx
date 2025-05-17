import { Link } from "react-router-dom";

import ItemCard from "./ItemCard";
import Thumbnail from "./Thumbnail";

import { SFile } from "@/types";

const FileCard = ({ file }: { file: SFile }) => {
    return (
        <Link
            to={`${file.url}${file._id}?spaceId=personal`}
            target="_blank"
            className="file-card"
        >
            <ItemCard
                item={file}
                leftContent={
                    <Thumbnail
                        type={file.type}
                        extension={file.extension}
                        url={`${file.url}${file._id}?spaceId=personal`}
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
