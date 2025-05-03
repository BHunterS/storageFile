import { Folder, SFile, BaseResponse } from ".";

export interface CreateFolderResponse extends BaseResponse {
    folder: Folder;
}

export interface GetFolderContentResponse extends BaseResponse {
    folderPath: string;
    folders: Folder[];
    files: SFile[];
}

export interface RenameFolderReponse extends BaseResponse {
    folder: Folder;
}

export interface GetFolderDetailsResponse extends BaseResponse {
    details: {
        totalSize: number;
        fileCount: number;
    };
}
