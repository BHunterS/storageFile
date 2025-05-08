import { BaseResponse, SFile } from ".";

export interface BaseFileResponse extends BaseResponse {
    file: SFile;
}
