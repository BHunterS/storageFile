import axios, { AxiosResponse } from "axios";

import { SERVER_URL } from "@/constants";

import { CreateFolderResponse, GetFolderContentResponse } from "@/types/folder";

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
    type: string,
    query: string,
    sort: string
): Promise<GetFolderContentResponse> => {
    const encodedPath: string = encodeURIComponent(folderPath);
    console.log(folderPath);
    const response: AxiosResponse = await axiosInstance.post(`/content`, {
        folderPath: encodedPath,
        type,
        query,
        sort,
    });
    return response.data;
};
