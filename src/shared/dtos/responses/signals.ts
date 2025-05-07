import MediaSoup from 'mediasoup-client';
import { UserActions } from '../../interfaces/socket-user';
import { DataConsumerOptions } from 'mediasoup-client/lib/DataConsumer';
export type UserMediaToggleActionType = "mute" | "unMute" | "turnOffVideo" | "turnOnVideo";
export interface CreatedTransportDTO {
    id: string;
    iceParameters: MediaSoup.types.IceParameters;
    iceCandidates: MediaSoup.types.IceCandidate[];
    dtlsParameters: MediaSoup.types.DtlsParameters;
}

export interface CreatedConsumerDTO {
    id: string;
    producerId: string;
    rtpParameters: MediaSoup.types.RtpParameters;
    kind: MediaSoup.types.MediaKind;
}
export interface IProducerUser {
    videoProducerId: string;
    audioProducerId: string;
    userId: string;
    name?: string;
}
export interface IProducersDTO {
    [socketId: string]: IProducerUser
}

export interface ToggleProducerStateDTO {
    room: string;
    action: UserMediaToggleActionType;
    socketId?: string;
}

export interface UserReactionsDTO {
    room: string;
    action: UserActions;
    actionState: boolean;
    socketId?: string;
}
