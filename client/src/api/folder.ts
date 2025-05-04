import axios, { AxiosResponse } from "axios";

import { SERVER_URL } from "@/constants";

import {
    CreateFolderResponse,
    GetFolderContentResponse,
    RenameFolderReponse,
    GetFolderDetailsResponse,
} from "@/types/folder";

const axiosInstance = axios.create({
    baseURL: `${SERVER_URL}/api/folders`,
    headers: {
        "Content-Type": "application/json",
    },
});

export const createFolder = async (
    name: string,
    parentFolder: string = "/"
): Promise<CreateFolderResponse> => {
    console.log(name, parentFolder);
    const response: AxiosResponse = await axiosInstance.post("/", {
        name,
        parentFolder,
    });
    return response.data;
};

export const getFolderContent = async (
    folderPath: string = "/",
    types: string,
    query: string,
    sort: string
): Promise<GetFolderContentResponse> => {
    const encodedPath: string = encodeURIComponent(folderPath);
    const response: AxiosResponse = await axiosInstance.post("/content", {
        encodedPath,
        types,
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
): Promise<RenameFolderReponse> => {
    const response: AxiosResponse = await axiosInstance.put(
        `/${folderId}/rename`,
        { newName }
    );

    return response.data;
};

export const deleteFolder = async (folderId: string) => {
    const response: AxiosResponse = await axiosInstance.delete(`/${folderId}`);

    return response.data;
};
