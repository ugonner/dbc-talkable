import MediaSoup from "mediasoup-client";
import { IProfile } from "../../interfaces/user";
import { IAccessibilityPreferences } from "../../interfaces/socket-user";
import { SctpStreamParameters } from "mediasoup-client/lib/SctpParameters";

export interface JoinRoomDTO {
    userId: string;
    room: string;
    userName: string;
    avatar: string;
}

export interface getRouterRTCCapabilitiesDTO{
    room: string;
}
export interface createTransportDTO {
    isProducer: boolean;
    room: string;
    protocol?: "tcp" | "sctp"
}

export interface ConnectTransportDTO {
    dtlsParameters: MediaSoup.types.DtlsParameters;
    transportId: string;
    room: string;
    isProducer: boolean;
}
export interface IProducerAppData {
    mediaKind?: "audio" | "video" | "data";
    isScreenShare?: boolean;
    isVideoTurnedOff?: boolean;
    isAudioTurnedOff?: boolean;
}

export interface CreateProducerDTO{
    rtpParameters: MediaSoup.types.RtpParameters;
    kind: MediaSoup.types.MediaKind;
    transportId: string;
    room: string;
    appData: IProducerAppData
}
export interface CreateDataProducerDTO{
    sctpStreamParameters: SctpStreamParameters,
    label?: string;
    protocol?: string;
    appData: {
        mediaKind: "audio" | "video" | "data";
        isScreenShare: boolean;
    },
    transportId: string;
    room: string;
    
}

export interface CreateConsumerDTO {
    rtpCapabilities: MediaSoup.types.RtpCapabilities;
    producerId: string;
    transportId: string;
    room: string;
    appData?: {
        mediaKind: "audio" | "video" | "data";
        isScreenShare: boolean;
    }
}

export interface ProducingDTO{
    producerId: string;
    userId: string;
}

export interface PublishProducerDTO{
    producerId: string;
    userId: string;
    room: string;
    socketId?: string;
}

export interface RequestPermissionDTO extends IProfile {
    producerId?: string;
}

export interface CloseMediaDTO {
    socketId?: string;
    mediaKind: "video" | "audio";
    isScreenSharing?: boolean;
    room?: string;
}

export interface AccessibilityPreferenceDTO {
    room: string;
    socketId?: string;
    accessibilityPreferences: IAccessibilityPreferences;
  }
  
  export interface ChatMessageDTO {
    room: string;
    socketId?: string;
    message: string;
    usesTextualCommunication?: boolean;
  }

  export interface CaptionDTO {
    room: string;
    socketId?: string;
    deliveryTime?: Date;
    buffer?: ArrayBuffer;
    captionText?: string
}

  export interface ICaptionText {
    partialResult?: string;
    finalResult?: string;
  }