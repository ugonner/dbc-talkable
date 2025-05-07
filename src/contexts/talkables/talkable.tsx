import React, {
  createContext,
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  IChat,
  IChatMessage,
  IChatUser,
} from "../../shared/interfaces/talkables/chat";
import { io, Socket } from "socket.io-client";
import { TextToSpeech, TTSOptions } from "@capacitor-community/text-to-speech";
import { TalkableChatEvents } from "../../shared/enums/talkables/chat-event.enum";
import {
  CommunicationModeEnum,
  LocalStorageKeys,
} from "../../shared/enums/talkables/talkables.enum";
import { useHistory } from "react-router";
import { IonButton, IonIcon, IonItem, IonModal, useIonToast } from "@ionic/react";
import { Model } from "vosk-browser";
import * as vosk from "vosk-browser";
import {
  audioSampleRate
} from "../../pages/talkable/VoiceMessaging";
import * as wav from "wav";
import * as bufferToStream from "buffer-to-stream";
import { modelPath } from "../../components/conference-room/Captioning";
import { APIBaseURL, AppBaseUrl, appPort, getData, serverPort, TalkableSocketBaseURL } from "../../api/base";
import { IApiResponse } from "../../shared/dtos/responses/api-response";
import { closeCircle } from "ionicons/icons";

export interface IStatusOverlayOptions {
  openOverlay: boolean;
  overlayEvent: TalkableChatEvents;
}

export interface ICommunicationMode {
  usesTextualCommunication?: boolean;
  usesVoiceCommunication?: boolean;
}

export enum TalkablePage {
  CHATS = "chats",
  CHAT_ROOM = "chat_room",
}
export interface IChatEntities {
  chats: IChat[];
  chatMessages: IChatMessage[];
  chatUser: IChatUser;
}
export interface ITalkableProps {
  chatMessages: IChatMessage[];
  setChatMessages: Dispatch<SetStateAction<IChatMessage[]>>;
  chats: IChat[];
  setChats: Dispatch<SetStateAction<IChat[]>>;
  currentChatRef: MutableRefObject<string>;
  socketRef: MutableRefObject<Socket | undefined>;
  communicationModeRef: MutableRefObject<ICommunicationMode | undefined>;
  ttsOptionsRef: MutableRefObject<TTSOptions>;
  statusOverlayOptions: IStatusOverlayOptions | undefined;
  setStatusOverlayOptions: Dispatch<
    SetStateAction<IStatusOverlayOptions | undefined>
  >;
  newChat: IChat | undefined;
  setNewChat: Dispatch<SetStateAction<IChat | undefined>>;
  userRef: MutableRefObject<IChatUser | undefined>;
  initChatEntities: () => Promise<IChatEntities>;
  attachSocketEvents: () => void;
  talkablePage: TalkablePage;
  setTalkablePage: Dispatch<SetStateAction<TalkablePage>>;
  chatRoomMessages: IChatMessage[];
  setChatRoomMessges: Dispatch<SetStateAction<IChatMessage[]>>;
  navigateTalkableChatPages: (options: {
    to: TalkablePage;
    chatRoomId?: string;
  }) => void;
  transcribeAudioURL: (audioUrl: string) => Promise<string>;
}

const TalkableContext: React.Context<ITalkableProps> = createContext(
  {} as ITalkableProps
);

export const TalkableContextProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [presentToast] = useIonToast();

  const chatsRef = useRef<IChat[]>([]);
  const chatMessagesRef = useRef<IChatMessage[]>([]);
  const history = useHistory();

  const initChatEntities = async (): Promise<IChatEntities> => {
    let chatEntities: IChatEntities;
    const localChatsData = localStorage.getItem(LocalStorageKeys.CHATS);
    const localChats: IChat[] = JSON.parse(
      localChatsData || JSON.stringify([])
    );

    const localChatMessagesData = localStorage.getItem(
      LocalStorageKeys.CHAT_MESSAGES
    );
    const localChatMessages: IChatMessage[] = JSON.parse(
      localChatMessagesData || JSON.stringify([])
    );

    //
    const localUserData = localStorage.getItem(LocalStorageKeys.CHAT_USER);
    const localUser: IChatUser = JSON.parse(
      localUserData || JSON.stringify({})
    );

    chatEntities = {
      chats: localChats,
      chatMessages: localChatMessages,
      chatUser: localUser,
    };
    return chatEntities;
  };

  const [chats, setChats] = useState<IChat[]>([]);
  const [chatMessages, setChatMessages] = useState<IChatMessage[]>([]);
  const currentChatRef = useRef<string>("");
  const socketRef = useRef<Socket | undefined>();
  const communicationModeRef = useRef<ICommunicationMode>({});
  const ttsOptionsRef = useRef<TTSOptions>({ text: "" });
  const [statusOverlayOptions, setStatusOverlayOptions] = useState<
    IStatusOverlayOptions | undefined
  >();
  const [newChat, setNewChat] = useState<IChat | undefined>();
  const userRef = useRef<IChatUser>();

  const attachSocketEvents = async () => {
    if (!socketRef.current?.connected) {
      const chatEntities = await initChatEntities();
      chatsRef.current = chatEntities.chats;
      chatMessagesRef.current = chatEntities.chatMessages;
      userRef.current = chatEntities.chatUser;
      setChats(chatsRef.current);
      setChatMessages(chatMessagesRef.current);

      const socketInit: Socket = await new Promise((resolve, reject) => {
        const socket: Socket = io(`${TalkableSocketBaseURL}`);
        socket.on("connect", () => {
          console.log("socket connecteed successfully");
          resolve(socket);
        });
      });

      socketRef.current = socketInit;
      //Addd listeners
      socketRef.current?.on(
        TalkableChatEvents.CHAT_MESSAGE,
        (data: IChatMessage) => {
          console.log("Chat_message fired WITH DATA", data);
          console.log("CURRENNT CHAT ID", currentChatRef.current);

          data.createdAt = new Date(Date.now()).toISOString();
          if (
            talkablePage === TalkablePage.CHAT_ROOM &&
            data.chatId === currentChatRef.current
          ) {
            data.isViewed = true;
            if (
              userRef.current?.communicationMode === CommunicationModeEnum.VOICE
            ) {
              TextToSpeech.speak({
                ...ttsOptionsRef.current,
                text: data.message || "",
              }).catch((err) =>
                console.log("Error speaking new message", err.message)
              );
            }
          }
          chatMessagesRef.current.push(data);
          setChatMessages(chatMessagesRef.current);
          if (data.chatId === currentChatRef.current) {
            setChatRoomMessges(
              chatMessagesRef.current.filter(
                (msg) => msg.chatId === data.chatId
              )
            );
          }

          localStorage.setItem(
            LocalStorageKeys.CHAT_MESSAGES,
            JSON.stringify(chatMessagesRef.current)
          );

          const roomChatIndex = chatsRef.current.findIndex(
            (cht) => cht.chatId === data.chatId
          );

          if (roomChatIndex !== -1)
            chatsRef.current[roomChatIndex].lastMessage = data;
          setChats(chatsRef.current);
          localStorage.setItem(
            LocalStorageKeys.CHATS,
            JSON.stringify(chatsRef.current)
          );
        }
      );

      socketRef.current?.on(
        TalkableChatEvents.JOIN_INVITE_ACCEPTANCE,
        (data: IChat) => {
          const chatIndex = chatsRef.current.findIndex(
            (cht) => cht.chatId === data.chatId
          );
          if (chatIndex !== -1) chatsRef.current[chatIndex] = data;
          else chatsRef.current.push(data);
          setChats(chatsRef.current);
          localStorage.setItem(
            LocalStorageKeys.CHATS,
            JSON.stringify(chatsRef.current)
          );
          setStatusOverlayOptions({
            openOverlay: false,
            overlayEvent: "" as TalkableChatEvents,
          });
          //navigate / show chat room
          currentChatRef.current = data.chatId;
          navigateTalkableChatPages({
            to: TalkablePage.CHAT_ROOM,
            roomChatId: data.chatId,
          });
          // history.push(`/talkable/chat-room/${data.chatId}`);
        }
      );

      socketRef.current?.on(
        TalkableChatEvents.JOIN_INVITE_REJECTION,
        (data) => {
          TextToSpeech.speak({
            ...ttsOptionsRef.current,
            text: "Official is busy, please you can rejoin later",
          }).catch((err) => {
            console.log("Error speacking chat rejection", err.message);
          });
        }
      );

      socketRef.current?.on(
        TalkableChatEvents.JOIN_ROOM_INVITE,
        (data: IChat) => {
          setNewChat(data);
          setStatusOverlayOptions({
            openOverlay: true,
            overlayEvent: TalkableChatEvents.JOIN_ROOM_INVITE,
          });
        }
      );
    }
  };

  const transcribeAudioURL = async (audioUrl: string): Promise<string> => {
    let transcript = "";
    try {
      const res = await fetch(`${audioUrl}`);
      if (!res.ok) throw new Error("Error fetching audio file");
      const arrBuffer: ArrayBuffer  = await res.arrayBuffer();
      let audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrBuffer);
      const channelData = audioBuffer.getChannelData(0);
     // const newBuffer = audioContext.createBuffer(1, channelData.length, audioSampleRate);
     const newBuffer = new AudioBuffer({
      numberOfChannels: 1,
      length: channelData.length,
      sampleRate: audioSampleRate
     })
      newBuffer.getChannelData(0).set(channelData);
      const model = await vosk.createModel(modelPath);
      model.setLogLevel(1);
      transcript = await new Promise((resolve, reject) => {
        const recognizer = new model.KaldiRecognizer(audioSampleRate);
  
        
        recognizer.on("result", async (message) => {
         console.log("message status", message.event)
          const resultText =
            message.event === "result" ? message.result.text : "";
          resolve(resultText)    
          });
          
          recognizer.on("error", (error) => reject(error) )
          
          recognizer.acceptWaveform(audioBuffer);
          
        })

        //-- clean up
        if(audioContext.state !== "closed") audioContext.close();
        audioContext = null as unknown as AudioContext;
        model.terminate();
        return transcript;
    } catch (error) {
      console.log("Error transcribing audio url", (error as Error).message);
    }
    return transcript;
  };

  const navigateTalkableChatPages = (options: {
    to: TalkablePage;
    roomChatId?: string;
  }) => {
    if (options.to === TalkablePage.CHAT_ROOM) {
      currentChatRef.current = options.roomChatId || currentChatRef.current;
      if (!currentChatRef.current)
        return presentToast("Unable to open chat, Please reload", 3000);
      setChatRoomMessges(
        chatMessages.filter((cht) => cht.chatId === currentChatRef.current)
      );
    }
    setTalkablePage(options.to);
  };

  const [talkablePage, setTalkablePage] = useState(TalkablePage.CHATS);
  const [chatRoomMessages, setChatRoomMessges] = useState<IChatMessage[]>([]);
  const [openWifiWarningOverlay, setOpenWifiWarningOverlay] = useState(false)
  useEffect(() => {
    const setSocketURL = async () => {
      if(!/localhost/i.test(window.location.hostname)) return;

      const res = await getData<{ipAddress: string}>(`${APIBaseURL.replace("http:", "https:")}/auth/host-ip`);
      if(!res.ipAddress) return setOpenWifiWarningOverlay(true);
      window.location.href = `https://${res.ipAddress}:${appPort}`
    }
    setSocketURL();
  }, [])
  const initTalkableContextProps: ITalkableProps = {
    chats,
    setChats,
    chatMessages,
    setChatMessages,
    currentChatRef,
    socketRef,
    communicationModeRef,
    ttsOptionsRef,
    statusOverlayOptions,
    setStatusOverlayOptions,
    newChat,
    setNewChat,
    userRef,
    initChatEntities,
    attachSocketEvents,
    talkablePage,
    setTalkablePage,
    chatRoomMessages,
    setChatRoomMessges,
    navigateTalkableChatPages,
    transcribeAudioURL
  };

  return (
    <TalkableContext.Provider value={initTalkableContextProps}>
      {children}
      <IonModal
      isOpen={openWifiWarningOverlay}
      onDidDismiss={() => setOpenWifiWarningOverlay(false)}
      backdropDismiss={false}
      >
        <IonItem>
          <IonButton
          slot="end"
          fill="clear"
          onClick={() => setOpenWifiWarningOverlay(false)}
          className="icon-only"
          aria-label="close wifi warning modal"
          >
            <IonIcon icon={closeCircle}></IonIcon>
          </IonButton>
        </IonItem>
        <div style={{textAlign: "center"}}>
          <h1>
            Error! There is no Wifi connection.
          </h1>
          <p>
            Please connect the system to a Wifi Hotspot
          </p>
        </div>
      </IonModal>
    </TalkableContext.Provider>
  );
};

export const useTalkableContextStore = () => useContext(TalkableContext);
