import axios, { AxiosResponse } from "axios";

import { SERVER_URL } from "@/constants";

const axiosInstance = axios.create({
    baseURL: `${SERVER_URL}/api/files`,
    headers: {
        "Content-Type": "application/json",
    },
});

export const uploadFile = async (data: FormData): Promise<boolean> => {
    const response = await axios.post(`${SERVER_URL}/api/files/upload`, data, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.success;
};

export const renameFile = async (
    fileId: string,
    newName: string
): Promise<boolean> => {
    try {
        const response: AxiosResponse = await axiosInstance.post(
            `/${fileId}/rename`,
            { newName }
        );

        return response.data.success;
    } catch (error) {
        console.error("Error renaming file:", error);
        throw error;
    }
};

export const deleteFile = async (fileId: string): Promise<boolean> => {
    try {
        const response: AxiosResponse = await axiosInstance.delete(
            `/${fileId}`
        );

        return response.data.success;
    } catch (error) {
        console.error("Error renaming file:", error);
        throw error;
    }
};

export const updateFileUsers = async (
    fileId: string,
    emails: string[]
): Promise<boolean> => {
    try {
        const response = await axiosInstance.post(`/share`, {
            fileId,
            emails,
        });

        return response.data.success;
    } catch (error) {
        console.error("Error renaming file:", error);
        throw error;
    }
};

export const restoreFile = async (fileId: string) => {
    try {
        const response: AxiosResponse = await axiosInstance.put(
            `/restore/${fileId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error restoring file:", error);
        throw error;
    }
};

export const updateFileFavorite = async (fileId: string): Promise<boolean> => {
    try {
        const response: AxiosResponse = await axiosInstance.put(
            `/favorite/${fileId}`
        );

        return response.data.success;
    } catch (error) {
        console.error("Error updating file favorite:", error);
        throw error;
    }
};
