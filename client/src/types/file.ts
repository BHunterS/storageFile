import { FileType, BaseResponse } from ".";

export interface GetFilesRequest {
    types?: FileType[];
    query?: string;
    sort?: string;
}

// TODO Base response in backend
export interface RenameFileRequest {
    oldName: string;
    newName: string;
}

export interface DeleteFileRequest {
    name: string;
}

export interface UpdateFileUsersRequest {
    fileId: string;
    emails: string[];
}

export interface RenameFileResponse extends BaseResponse {}
export interface DeleteFileResponse extends BaseResponse {}
