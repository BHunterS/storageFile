import React from "react";
import { cn } from "@/lib/utils";
import { getFileIcon } from "@/utils/helpers";

interface Props {
    type: string;
    extension: string;
    url?: string;
    imageClassName?: string;
    className?: string;
}

export const Thumbnail: React.FC<Props> = ({
    type,
    extension,
    url = "",
    imageClassName,
    className,
}) => {
    const isImage = type === "image" && extension !== "svg";
    const imageUrl = isImage ? url : getFileIcon(extension, type);

    return (
        <figure className={cn("thumbnail", className)}>
            <img
                src={imageUrl}
                alt="thumbnail"
                width={100}
                height={100}
                className={cn(
                    "w-8 h-8 object-contain",
                    imageClassName,
                    isImage && "thumbnail-image"
                )}
            />
        </figure>
    );
};

export default Thumbnail;
