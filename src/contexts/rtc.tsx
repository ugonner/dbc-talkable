import { Device } from "mediasoup-client";
import { DataProducer, Producer, Transport } from "mediasoup-client/lib/types";
import { createContext, Dispatch, MutableRefObject, PropsWithChildren, SetStateAction, useContext, useRef, useState, useSyncExternalStore } from "react";
import { Socket } from "socket.io-client";
import { IAccessibilityPreferences, IProducerUser, IUserReactions, UserActions } from "../shared/interfaces/socket-user";
import { BroadcastEvents } from "../shared/enums/events.enum";
import { IRoomMessage } from "../components/conference-room/RoomMessages";
import { IRoomContext } from "../shared/interfaces/room";
import { IProducerAppData } from "../shared/dtos/requests/signals";

export interface IRTCTools {
    socket: Socket | undefined;
    setSocket: Dispatch<SetStateAction<Socket | undefined>>;
    device: Device;
    setDevice: Dispatch<SetStateAction<Device>>;
    consumerTransport: Transport | undefined;
    setProducerTransport: Dispatch<SetStateAction<Transport | undefined>>;
    producerTransport: Transport | undefined;
    setConsumerTransport: Dispatch<SetStateAction<Transport | undefined>>;
    videoProducer?: Producer;
    setVideoProducer: Dispatch<SetStateAction<Producer>>;
    audioProducer?: Producer;
    setAudioProducer: Dispatch<SetStateAction<Producer>>;
    userMediaStream: MediaStream | undefined;
    setUserMediaStream: Dispatch<SetStateAction<MediaStream | undefined>>;
    videoTurnedOff: boolean;
    setVideoTurnedOff: Dispatch<SetStateAction<boolean>>;
    audioTurnedOff: boolean;
    setAudioTurnedOff: Dispatch<SetStateAction<boolean>>;
    producerAppDataRef: MutableRefObject<IProducerAppData>
    userReactionsState: IUserReactions,
    setUserReactionsState: Dispatch<SetStateAction<IUserReactions>>,
    accessibilityPreferences: IAccessibilityPreferences,
    setAccessibilityPreferences: Dispatch<SetStateAction<IAccessibilityPreferences>>,
    pinnedProducerUser: IProducerUser | null;
    setPinnedProducerUser: Dispatch<SetStateAction<IProducerUser | null>>;
    chatMessages: IRoomMessage[];
    setChatMessages: Dispatch<SetStateAction<IRoomMessage[]>>
    subTitles: IRoomMessage[];
    setSubTitles: Dispatch<SetStateAction<IRoomMessage[]>>;
    roomContext: IRoomContext | undefined;
    setRoomContext: Dispatch<SetStateAction<IRoomContext | undefined>>;
    dataProducer: DataProducer | undefined;
    setDataProducer: Dispatch<SetStateAction<DataProducer | undefined>>;
    setShowModalText: Dispatch<SetStateAction<string>>;
    showModalText: string;
    currentRoomRef: MutableRefObject<string>
    captioningRoomRef: MutableRefObject<string | null>
}

export const RTCToolsContext = createContext({} as unknown as IRTCTools)

export const RTCToolsProvider = ({children}: PropsWithChildren) => {
    const [socket, setSocket] = useState<Socket>();
    const [device, setDevice] = useState({} as Device);
    const [producerTransport, setProducerTransport] = useState<Transport>();
    const [consumerTransport, setConsumerTransport] = useState<Transport>();
    const [videoProducer, setVideoProducer] = useState({} as Producer);
    const [audioProducer, setAudioProducer] = useState({} as Producer);
    
    const [audioTurnedOff, setAudioTurnedOff] = useState(false);
    const [videoTurnedOff, setVideoTurnedOff] = useState(false);
    const [accessibilityPreferences, setAccessibilityPreferences] = useState<IAccessibilityPreferences>({});
    const [pinnedProducerUser, setPinnedProducerUser] = useState<IProducerUser | null>(null);
    const [chatMessages, setChatMessages] = useState<IRoomMessage[]>([]);
    const [subTitles, setSubTitles] = useState<IRoomMessage[]>([]);
    const [roomContext, setRoomContext] = useState<IRoomContext>();
    const [dataProducer, setDataProducer] = useState<DataProducer>();

    const [userMediaStream, setUserMediaStream] = useState<MediaStream>()
    const [userReactionsState, setUserReactionsState] = useState<IUserReactions>({})
    const [showModalText, setShowModalText] = useState("");
    const producerAppDataRef = useRef<IProducerAppData>({})
    const currentRoomRef = useRef<string>("");
    const captioningRoomRef = useRef<string | null>(null);
    const initRTCTools: IRTCTools = {
        socket, setSocket, device, setDevice, producerTransport, setProducerTransport, consumerTransport, setConsumerTransport, videoProducer, setVideoProducer,audioProducer, setAudioProducer,  userMediaStream, setUserMediaStream, audioTurnedOff, setAudioTurnedOff, videoTurnedOff, setVideoTurnedOff, userReactionsState, setUserReactionsState, accessibilityPreferences, setAccessibilityPreferences, pinnedProducerUser, setPinnedProducerUser, chatMessages, setChatMessages, subTitles, setSubTitles, roomContext, setRoomContext, dataProducer, setDataProducer, showModalText, setShowModalText, producerAppDataRef, currentRoomRef, captioningRoomRef
    };
    
    return (
        <RTCToolsContext.Provider value={initRTCTools}>{children}</RTCToolsContext.Provider>
    )
}
export const useRTCToolsContextStore = () => useContext(RTCToolsContext);