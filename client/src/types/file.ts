import { BaseResponse, SFile } from ".";

export interface BaseFileResponse extends BaseResponse {
    file: SFile;
}

export interface GetSharedEmailResponse extends BaseResponse {
    emails: string[];
}
