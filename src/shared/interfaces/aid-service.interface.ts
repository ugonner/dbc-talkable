import { IAuthUserProfile } from "./user";

export interface IAidService {
    id: number;
    name: string;
    description?: string;
    users?: IAuthUserProfile[]
}

export interface IAidServiceProvider {
    userId: string;
    aidServiceId: number;
}