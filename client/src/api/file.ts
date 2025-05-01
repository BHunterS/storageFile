import axios from "axios";

import { SERVER_URL } from "@/constants";

import {
    GetFilesRequest,
    GetMyFilesResponse,
    RenameFileRequest,
    DeleteFileRequest,
    UpdateFileUsersRequest,
} from "@/types/file";

export const getMyFiles = async (
    params: GetFilesRequest = {}
): Promise<GetMyFilesResponse[]> => {
    try {
        const response = await axios.post<{ files: GetMyFilesResponse[] }>(
            `${SERVER_URL}/api/files`,
            params
        );

        return response.data.files;
    } catch (error) {
        console.error("Error fetching files:", error);
        throw error;
    }
};

export const renameFile = async (
    params: RenameFileRequest
): Promise<boolean> => {
    try {
        const response = await axios.post(
            `${SERVER_URL}/api/files/rename`,
            params
        );

        return response.data.success;
    } catch (error) {
        console.error("Error renaming file:", error);
        throw error;
    }
};

export const deleteFile = async ({
    name,
}: DeleteFileRequest): Promise<boolean> => {
    try {
        const response = await axios.delete(`${SERVER_URL}/api/files/${name}`);

        return response.data.success;
    } catch (error) {
        console.error("Error renaming file:", error);
        throw error;
    }
};

export const updateFileUsers = async ({
    fileId,
    emails,
}: UpdateFileUsersRequest): Promise<boolean> => {
    try {
        const response = await axios.post(`${SERVER_URL}/api/files/share`, {
            fileId,
            emails,
        });

        return response.data.success;
    } catch (error) {
        console.error("Error renaming file:", error);
        throw error;
    }
};
