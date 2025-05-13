import { AxiosResponse } from "axios";

import axiosInstance from "@/api/axiosInstance";

import { BaseProfileResponse, UpdateUserInfoRequest } from "@/types/profile";

import { BaseResponse } from "@/types";

export const getMyProfile = async (): Promise<BaseProfileResponse> => {
    const response: AxiosResponse = await axiosInstance.get(
        "/profiles/myprofile"
    );

    return response.data;
};

export const UpdateUserInfo = async (
    data: UpdateUserInfoRequest
): Promise<BaseResponse> => {
    const response: AxiosResponse = await axiosInstance.put("/profiles", data);

    return response.data;
};
