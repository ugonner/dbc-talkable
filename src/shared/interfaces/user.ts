import { IAuthUser } from "../../components/auth/LoginOrRegister";
import { IAidService } from "./aid-service.interface";

export interface IUser {
    id: number;
    userId: string;
    name: string;
}

export interface IProfile {
    id: number;
    userId: string;
    firstName: string;
    lastName: string;
    avatar: string;
    gender?: string;
}
export interface IAuthUserProfile extends IAuthUser {
    id?: number;
    userId?: string;
    role?: unknown;
    profile?: IProfile;
    aidServices: IAidService[];
}

export interface ILoginResponse extends IAuthUserProfile{
    token?: string;
    refreshToken?: string;
}