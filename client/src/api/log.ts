import { AxiosResponse } from "axios";

import axiosInstance from "./axiosInstance";

import { GetLogsResponse } from "@/types/log";

export const getLogs = async (): Promise<GetLogsResponse> => {
    const response: AxiosResponse<GetLogsResponse> = await axiosInstance.get(
        "/logs"
    );
    return response.data;
};
