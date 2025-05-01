import FormattedDateTime from "./FormattedDateTime";
import { Folder, SFile } from "@/types";
import ActionDropdown from "./ActionDropdown";

interface Props {
    item: SFile | Folder;
    leftContent: React.ReactNode;
    bottomContent?: React.ReactNode;
}

const ItemCard = ({ item, leftContent, bottomContent }: Props) => {
    return (
        <>
            <div className="flex justify-between">
                {leftContent}

                {/* <div className="flex flex-col items-end justify-between">
                    <ActionDropdown file={file} />
                    <p className="body-1">{convertFileSize(file.size)}</p>
                </div> */}
            </div>

            <div className="file-card-details">
                <p className="subtitle-2 line-clamp-1">{item.name}</p>
                <FormattedDateTime
                    date={item.createdAt}
                    className="body-2 text-light-100"
                />
                {bottomContent}
            </div>
        </>
    );
};
export default ItemCard;
