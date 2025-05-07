import { useParams } from "react-router"
import { TalkableContextProvider, useTalkableContextStore } from "../../contexts/talkables/talkable";
import { useEffect, useRef, useState } from "react";
import { IChat, IChatMessage, IChatUser } from "../../shared/interfaces/talkables/chat";
import { TextToSpeech, TTSOptions } from "@capacitor-community/text-to-speech";
import { IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonPage, IonTextarea, IonTitle, IonToolbar, useIonViewWillEnter } from "@ionic/react";
import { ChatMessage } from "./ChatMessage";
import { CommunicationModeEnum, LocalStorageKeys } from "../../shared/enums/talkables/talkables.enum";
import { TalkableChatEvents } from "../../shared/enums/talkables/chat-event.enum";
import { send } from "ionicons/icons";
import { DBCChatUser } from "./Chats";
import { Messaging } from "./Messaging";
import { VoiceMessaging } from "./VoiceMessaging";

export interface IChatRoomProps {
    chatId: string;
}

export const ChatRoom = ({chatId}: IChatRoomProps) => {
    const { ttsOptionsRef, userRef, currentChatRef, chats, chatMessages, chatRoomMessages} = useTalkableContextStore();
    const chatMessagesRef = useRef<IChatMessage[]>(chatMessages);
    const chat: IChat = chats.find((cht) => cht.chatId === (chatId || currentChatRef.current) ) as IChat;

    console.log("chat in CHAT ROOM", chat, "chatid", chatId, "current ref", currentChatRef.current);
    console.log("CHATS IN ROOM", chats);
    const reRender = () => {
        currentChatRef.current = chatId;
        chatMessagesRef.current = chatMessages;
        chatMessagesRef.current.forEach((msg, i) => {
                // update isviewed status for local storage;
              if(msg.chatId === chatId){
                if(!msg.isViewed) {
                    msg.isViewed = true;
                    if(userRef.current?.communicationMode === CommunicationModeEnum.VOICE){
                        TextToSpeech.speak({...ttsOptionsRef.current, text: (msg.message || "")})
                        .catch((err) => console.log("Error speaking message", err))
                    }
                  }
              }
        });
        console.log("CHAT ROOM RERENDERED");
        localStorage.setItem(LocalStorageKeys.CHAT_MESSAGES, JSON.stringify(chatMessagesRef.current))
    };
    reRender();
    

    return (
                <div>
                    
                    {
                        chatRoomMessages.length > 0 && chatRoomMessages.map((msg, i) => (
                            <IonItem key={i}>
                                <div slot={msg.sender?.userName === userRef.current?.userName ? "start" : "end"}>
                                    <ChatMessage chatMessage={msg} />
                                </div>
                            </IonItem>
                            
                            
                            
                        ))
                    }
                    {
                        chatRoomMessages.length === 0 && (
                            <IonItem>
                                <IonLabel>
                                    <h3>No Messages</h3>
                                    <p>No messages has been sent over this chat recently</p>
                                </IonLabel>
                            </IonItem>
                        )
                    }
                    {
                        chat && userRef.current?.communicationMode === CommunicationModeEnum.TEXT  && (<Messaging chat={chat} />)
                    }
                    {
                        chat && userRef.current?.communicationMode === CommunicationModeEnum.VOICE  && (<VoiceMessaging chat={chat} />)
                    }
                    
                </div>
            
    )
}
