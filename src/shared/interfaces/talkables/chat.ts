import { CommunicationModeEnum } from "../../enums/talkables/talkables.enum";


export interface IChatUser {
    userId: string;
    userName: string;
    avatar?: string;
    organization?: string;
    purpose?: string;
    communicationMode?: CommunicationModeEnum;
    gender?: "M" | "F";
    phoneNumber: string;

}

export interface IChat {
    chatId: string;
    users: IChatUser[];
    lastMessage?: IChatMessage
}

export interface IMessageAttachment {
    attachmentUrl: string;
    attachmentType: "audio" | "image" | "video";
}

export interface IChatMessage {
    chatId: string;
    message?: string;
    sender: IChatUser;
    receiver: IChatUser;
    isViewed: boolean;
    createdAt: string
    isAdmin?: boolean;
    socketId?: string;
    attachment?: IMessageAttachment;
}