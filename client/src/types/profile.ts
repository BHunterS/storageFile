import { BaseResponse, Profile } from ".";

export interface BaseProfileResponse extends BaseResponse {
    profile: Profile;
}

export interface UpdateUserInfoRequest extends Omit<Profile, "accountId"> {
    name: string;
    email: string;
    avatar: string;
}
