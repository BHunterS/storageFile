import { AxiosResponse } from "axios";

import axiosInstance from "@/api/axiosInstance";

import {
    BaseFolderResponse,
    GetFolderContentResponse,
    GetFolderDetailsResponse,
} from "@/types/folder";
import { BaseResponse } from "@/types";

export const createFolder = async (
    name: string,
    parentFolder: string = "/"
): Promise<BaseFolderResponse> => {
    console.log(name, parentFolder);
    const response: AxiosResponse = await axiosInstance.post("/folders", {
        name,
        parentFolder,
    });
    return response.data;
};

export const getFolderContent = async (
    folderPath: string = "/",
    query: string = "",
    sort: string = ""
): Promise<GetFolderContentResponse> => {
    const encodedPath: string = encodeURIComponent(folderPath);
    const response: AxiosResponse = await axiosInstance.get(
        "/folders/content",
        {
            params: {
                encodedPath,
                query,
                sort,
            },
        }
    );

    return response.data;
};

export const getFolderDetails = async (
    folderId: string
): Promise<GetFolderDetailsResponse> => {
    const response: AxiosResponse = await axiosInstance.get(
        `/folders/${folderId}/details`
    );

    return response.data;
};

export const renameFolder = async (
    folderId: string,
    newName: string
): Promise<BaseFolderResponse> => {
    const response: AxiosResponse = await axiosInstance.put(
        `/folders/${folderId}/rename`,
        { newName }
    );

    return response.data;
};

export const deleteFolder = async (folderId: string): Promise<BaseResponse> => {
    const response: AxiosResponse = await axiosInstance.delete(
        `/folders/${folderId}`
    );

    return response.data;
};

export const restoreFolder = async (
    folderId: string
): Promise<BaseResponse> => {
    const response: AxiosResponse = await axiosInstance.put(
        `/folders/restore/${folderId}`
    );

    return response.data;
};
