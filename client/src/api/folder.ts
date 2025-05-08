import axios, { AxiosResponse } from "axios";

import { SERVER_URL } from "@/constants";

import {
    BaseFolderResponse,
    GetFolderContentResponse,
    GetFolderDetailsResponse,
} from "@/types/folder";
import { BaseResponse } from "@/types";

const axiosInstance = axios.create({
    baseURL: `${SERVER_URL}/api/folders`,
    headers: {
        "Content-Type": "application/json",
    },
});

export const createFolder = async (
    name: string,
    parentFolder: string = "/"
): Promise<BaseFolderResponse> => {
    console.log(name, parentFolder);
    const response: AxiosResponse = await axiosInstance.post("/", {
        name,
        parentFolder,
    });
    return response.data;
};

export const getFolderContent = async (
    folderPath: string = "/",
    query: string,
    sort: string
): Promise<GetFolderContentResponse> => {
    const encodedPath: string = encodeURIComponent(folderPath);
    const response: AxiosResponse = await axiosInstance.post("/content", {
        encodedPath,
        query,
        sort,
    });
    return response.data;
};

export const getFolderDetails = async (
    folderId: string
): Promise<GetFolderDetailsResponse> => {
    const response: AxiosResponse = await axiosInstance.get(
        `/${folderId}/details`
    );

    return response.data;
};

export const renameFolder = async (
    folderId: string,
    newName: string
): Promise<BaseFolderResponse> => {
    const response: AxiosResponse = await axiosInstance.put(
        `/${folderId}/rename`,
        { newName }
    );

    return response.data;
};

export const deleteFolder = async (folderId: string): Promise<BaseResponse> => {
    const response: AxiosResponse = await axiosInstance.delete(`/${folderId}`);

    return response.data;
};

export const restoreFolder = async (
    folderId: string
): Promise<BaseResponse> => {
    const response: AxiosResponse = await axiosInstance.put(
        `/restore/${folderId}`
    );

    return response.data;
};
