import { AxiosResponse } from "axios";

import axiosInstance from "./axiosInstance";

import { GetPublicKeyResponse, GetEncryptedDataResponse } from "@/types/cipher";

export const getPublicKey = async (): Promise<GetPublicKeyResponse> => {
    const response: AxiosResponse<GetPublicKeyResponse> =
        await axiosInstance.get("/ciphers/public-key");
    return response.data;
};

export const encryptData = async (
    data: string
): Promise<GetEncryptedDataResponse> => {
    const response: AxiosResponse<GetEncryptedDataResponse> =
        await axiosInstance.post("/ciphers/encrypt", { data });
    return response.data;
};
