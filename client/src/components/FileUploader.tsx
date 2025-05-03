import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { useUploadStore } from "@/store/uploadStore";

import { uploadFile } from "@/api/file";

import { useToast } from "@/hooks/use-toast";

import { cn } from "@/lib/utils";
import { convertFileToUrl, getFileType } from "@/utils/helpers";

import { MAX_FILE_SIZE } from "@/constants";

import { Button } from "./ui/button";
import Thumbnail from "./Thumbnail";

interface Props {
    accountId: string | undefined;
    className?: string;
    folderPath: string;
}

const FileUploader = ({ accountId, className, folderPath }: Props) => {
    const { toast } = useToast();
    const [files, setFiles] = useState<File[]>([]);

    const { toggleTrigger } = useUploadStore();

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            setFiles(acceptedFiles);

            const uploadPromises = acceptedFiles.map(async (file) => {
                if (file.size > MAX_FILE_SIZE) {
                    setFiles((prevFiles) =>
                        prevFiles.filter((f) => f.name !== file.name)
                    );

                    return toast({
                        description: (
                            <p className="body-2 text-white">
                                <span className="font-semibold">
                                    {file.name}
                                </span>{" "}
                                is too large. Max file size is 50MB.
                            </p>
                        ),
                        className: "error-toast",
                    });
                }

                const { type } = getFileType(file.name);

                try {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("type", type);
                    formData.append("accountId", accountId ?? "");
                    formData.append("folderPath", folderPath);

                    const isUploaded = await uploadFile(formData);

                    if (isUploaded) {
                        setFiles((prevFiles) =>
                            prevFiles.filter((f) => f.name !== file.name)
                        );
                    }
                } catch {
                    setFiles((prevFiles) =>
                        prevFiles.filter((f) => f.name !== file.name)
                    );
                    toast({
                        description: (
                            <p className="body-2 text-white">
                                <span className="font-semibold">
                                    {file.name}
                                </span>{" "}
                                failed to upload.
                            </p>
                        ),
                        className: "error-toast",
                    });
                }
            });

            await Promise.all(uploadPromises);
            toggleTrigger();
        },
        [accountId, folderPath, toggleTrigger, toast]
    );

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleRemoveFile = (
        e: React.MouseEvent<HTMLImageElement, MouseEvent>,
        fileName: string
    ) => {
        e.stopPropagation();
        setFiles((prevFiles) =>
            prevFiles.filter((file) => file.name !== fileName)
        );
    };

    return (
        <div {...getRootProps()} className="cursor-pointer">
            <input {...getInputProps()} />
            <Button type="button" className={cn("uploader-button", className)}>
                <img
                    src="/assets/icons/upload.svg"
                    alt="upload"
                    width={24}
                    height={24}
                />
                <p>Upload</p>
            </Button>

            {files.length > 0 && (
                <ul className="uploader-preview-list">
                    <h4 className="h4 text-light-100">Uploading</h4>

                    {files.map((file, index) => {
                        const { type, extension } = getFileType(file.name);

                        return (
                            <li
                                key={`${file.name}-${index}`}
                                className="uploader-preview-item"
                            >
                                <div className="flex items-center gap-3">
                                    <Thumbnail
                                        type={type}
                                        extension={extension}
                                        url={convertFileToUrl(file)}
                                    />

                                    <div className="preview-item-name">
                                        {file.name}
                                        <img
                                            src="/assets/icons/file-loader.gif"
                                            width={80}
                                            height={26}
                                            alt="Loader"
                                        />
                                    </div>
                                </div>

                                <img
                                    src="/assets/icons/remove.svg"
                                    width={24}
                                    height={24}
                                    alt="Remove"
                                    onClick={(e) =>
                                        handleRemoveFile(e, file.name)
                                    }
                                    className="cursor-pointer"
                                />
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default FileUploader;
