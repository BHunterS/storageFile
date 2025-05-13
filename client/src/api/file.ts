import { AxiosResponse } from "axios";

import axiosInstance from "@/api/axiosInstance";

import { BaseResponse } from "@/types";
import { BaseFileResponse } from "@/types/file";

export const uploadFile = async (data: FormData): Promise<BaseResponse> => {
    const response = await axiosInstance.post("/files/upload", data, {
        headers: {
            "Content-Type": "multipart/form-data",
            "X-Skip-Interceptor": "true",
        },
    });
    return response.data;
};

export const renameFile = async (
    fileId: string,
    newName: string
): Promise<BaseFileResponse> => {
    try {
        const response: AxiosResponse = await axiosInstance.post(
            `/files/${fileId}/rename`,
            { newName }
        );

        return response.data;
    } catch (error) {
        console.error("Error renaming file:", error);
        throw error;
    }
};

export const deleteFile = async (fileId: string): Promise<BaseResponse> => {
    try {
        const response: AxiosResponse = await axiosInstance.delete(
            `/files/${fileId}`
        );

        return response.data;
    } catch (error) {
        console.error("Error renaming file:", error);
        throw error;
    }
};

export const updateFileUsers = async (
    fileId: string,
    emails: string[]
): Promise<BaseFileResponse> => {
    try {
        const response = await axiosInstance.post(`/files/share`, {
            fileId,
            emails,
        });

        return response.data;
    } catch (error) {
        console.error("Error renaming file:", error);
        throw error;
    }
};

export const restoreFile = async (
    fileId: string
): Promise<BaseFileResponse> => {
    try {
        const response: AxiosResponse = await axiosInstance.put(
            `/files/restore/${fileId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error restoring file:", error);
        throw error;
    }
};

export const updateFileFavorite = async (
    fileId: string
): Promise<BaseFileResponse> => {
    try {
        const response: AxiosResponse = await axiosInstance.put(
            `/files/favorite/${fileId}`
        );

        return response.data;
    } catch (error) {
        console.error("Error updating file favorite:", error);
        throw error;
    }
};
