import { AxiosResponse } from "axios";

import axiosInstance from "@/api/axiosInstance";

import {
    BaseSpaceResponse,
    GetMySpacesResponse,
    CheckSpaceAccessResponse,
    CreateSpaceInput,
    UpdateSpaceInput,
    AddMemberInput,
} from "@/types/space";
import { BaseResponse } from "@/types";

export const createSpace = async (
    input: CreateSpaceInput
): Promise<BaseSpaceResponse> => {
    const response: AxiosResponse = await axiosInstance.post("/spaces", input);

    return response.data;
};

export const getSpaceById = async (
    spaceId: string
): Promise<BaseSpaceResponse> => {
    const response: AxiosResponse = await axiosInstance.post(
        `/spaces/${spaceId}`
    );

    return response.data;
};

export const getMySpaces = async (): Promise<GetMySpacesResponse> => {
    const response: AxiosResponse = await axiosInstance.get("/my");

    return response.data;
};

export const updateSpace = async (
    spaceId: string,
    input: UpdateSpaceInput
): Promise<BaseSpaceResponse> => {
    const response: AxiosResponse = await axiosInstance.put(
        `/spaces/${spaceId}`,
        input
    );

    return response.data;
};

export const addMember = async (
    spaceId: string,
    input: AddMemberInput
): Promise<BaseSpaceResponse> => {
    const response: AxiosResponse = await axiosInstance.post(
        `/spaces/${spaceId}/members`,
        input
    );

    return response.data;
};

export const changeMemberRole = async (
    spaceId: string,
    memberId: string
): Promise<BaseSpaceResponse> => {
    const response: AxiosResponse = await axiosInstance.put(
        `/spaces/${spaceId}/members/${memberId}`
    );

    return response.data;
};

export const removeMember = async (
    spaceId: string,
    memberId: string
): Promise<BaseSpaceResponse> => {
    const response: AxiosResponse = await axiosInstance.delete(
        `/spaces/${spaceId}/members/${memberId}`
    );

    return response.data;
};

export const deleteSpace = async (spaceId: string): Promise<BaseResponse> => {
    const response: AxiosResponse = await axiosInstance.delete(
        `/spaces/${spaceId}`
    );

    return response.data;
};

export const checkSpaceAccess = async (
    spaceId: string
): Promise<CheckSpaceAccessResponse> => {
    const response: AxiosResponse = await axiosInstance.get(
        `/spaces/${spaceId}/access`
    );

    return response.data;
};
