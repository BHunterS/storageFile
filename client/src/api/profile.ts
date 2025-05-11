import axios, { AxiosResponse } from "axios";

import { SERVER_URL } from "@/constants";
import { BaseProfileResponse, UpdateUserInfoRequest } from "@/types/profile";

import { BaseResponse } from "@/types";

const axiosInstance = axios.create({
    baseURL: `${SERVER_URL}/api/profiles`,
    headers: {
        "Content-Type": "application/json",
    },
});

export const getMyProfile = async (): Promise<BaseProfileResponse> => {
    const response: AxiosResponse = await axiosInstance.get("/myprofile");

    return response.data;
};

export const UpdateUserInfo = async (
    data: UpdateUserInfoRequest
): Promise<BaseResponse> => {
    const response: AxiosResponse = await axiosInstance.put("/", data);

    return response.data;
};
