import { Producer } from "mediasoup-client/lib/types";
import { IProfile } from "./user";
import { IAidServiceProvider } from "./aid-service.interface";

export interface IRoom {
    id?: number;
    roomId?: string;
    startTime?: string;
    endTime?: string;
    owner?: IProfile;
    invitees?: IProfile[];
    aidServiceProviders: IAidServiceProvider[]
}

export interface QueryRoomDTO{
   invitees?: string;
   userId?: string;
   id?: number;
   roomId?: string;
   startTime?: string;
   endTime?: string;
}

export interface ICreateRoomDTO extends IRoom {
    startTime: string;
    duration: string;
    roomId?: string;
}


export interface IRoomContext {
    screenShareProducer?: Producer;
    screenShareProducerId?: string;
    isSharing?: boolean;
    room?: string;
    sharerUserName?: string;
    sharerSocketId: string;
    hasSpecialPresenter?: boolean;
    specialPresenterSocketId?: string;
    accessibilityPriority?: AccessibilityPriority   
}

export enum AccessibilityPriority {
  HIGH = "High",
  MEDIUM = "Medium",
  NONE = "None"
}

export interface ICanJoinAs {
    isOwner?: boolean;
    isInvitee?: boolean;
    isAidServiceProvider?: boolean;
    isSpecialPresenter?: boolean;
}