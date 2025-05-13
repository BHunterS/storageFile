import { BaseResponse } from ".";

export interface GetPublicKeyResponse extends BaseResponse {
    publicKey: string;
}

export interface GetEncryptedDataResponse extends BaseResponse {
    data: string;
}
