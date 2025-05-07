export interface IApiResponse <T>{
    message: string;
    status: string;
    data?: T
    error?: unknown;
}