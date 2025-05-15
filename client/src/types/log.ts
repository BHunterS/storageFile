import { BaseResponse, Log } from ".";

export interface GetLogsResponse extends BaseResponse {
    logs: Log[];
}
