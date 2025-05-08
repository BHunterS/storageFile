import { Folder, SFile, BaseResponse } from ".";

export interface BaseFolderResponse extends BaseResponse {
    folder: Folder;
}

export interface GetFolderContentResponse extends BaseResponse {
    folderPath: string;
    folders: Folder[];
    files: SFile[];
}

export interface GetFolderDetailsResponse extends BaseResponse {
    details: {
        totalSize: number;
        fileCount: number;
    };
}
