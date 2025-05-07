import { useParams } from "react-router"
import { TalkableContextProvider, useTalkableContextStore } from "../../contexts/talkables/talkable";
import { useEffect, useRef, useState } from "react";
import { IChat, IChatMessage, IChatUser } from "../../shared/interfaces/talkables/chat";
import { TextToSpeech, TTSOptions } from "@capacitor-community/text-to-speech";
import { IonContent, IonHeader, IonItem, IonLabel, IonPage, IonTitle, IonToolbar, useIonViewWillEnter } from "@ionic/react";
import { ChatMessage } from "./ChatMessage";
import { LocalStorageKeys } from "../../shared/enums/talkables/talkables.enum";


const ChatRoom = () => {
    const params = useParams<{chatId: string}>();
    const chatId = params.chatId;
    const {chatMessages, setChatMessages, chats, socketRef, currentChatRef, communicationModeRef, userRef, initChatEntities} = useTalkableContextStore();
    const [roomChatMessages, setRoomChatMessags] = useState<IChatMessage[]>([]);
    

    
    const ttsOptionsRef = useRef<TTSOptions>({text: ""});
    const chatMessagesRef = useRef<IChatMessage[]>([]);
    const [unviewedChatMessages, setUnviewedChatMessages] = useState<IChatMessage[]>([]);

    useEffect(() => {
        const init = async () => {
            try{
                console.log("chatMessages IN USE EFFECT", chatMessages)
                const {chatMessages: localChatMessages, chatUser: localChatUser} = await initChatEntities();
                chatMessagesRef.current = localChatMessages;
                userRef.current = localChatUser;
            }catch(error){
                console.log("Error initializing chat entities in chat room", (error as Error).message)
            }
        }
        init();
    }, [])

    useIonViewWillEnter(() => {
        currentChatRef.current = chatId;
        const roomMsgs: IChatMessage[] = [];
        const unviewedMsgs: IChatMessage[] = [];
        
        chatMessagesRef.current.forEach((msg, i) => {
            if(msg.chatId === chatId){
                
              roomMsgs.push(msg);
                // update isviewed status for local storage;
              if(!msg.isViewed) {
                unviewedMsgs.push(msg);
                msg.isViewed = true;
                if(communicationModeRef.current?.usesVoiceCommunication){
                    TextToSpeech.speak({...ttsOptionsRef.current, text: (msg.message || "")})
                    .catch((err) => console.log("Error speaking message", err.message))
                }
              }
            }
             
        });
        setRoomChatMessags(roomMsgs);
        setUnviewedChatMessages(unviewedMsgs);
        console.log("chatmessages", chatMessages);
        localStorage.setItem(LocalStorageKeys.CHAT_MESSAGES, JSON.stringify(chatMessagesRef.current))

        
    })


    return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonItem>
                            <IonTitle>
                                {roomChatMessages[0]?.sender?.userName || ""}
                            </IonTitle>
                        </IonItem>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    
                    {
                        roomChatMessages.length > 0 && roomChatMessages.map((msg, i) => (
                            <IonItem key={i}>
                                <div slot={msg.sender?.userName === userRef.current?.userName ? "start" : "end"}>
                                    <ChatMessage chatMessage={msg} />
                                </div>
                            </IonItem>
                            
                            
                            
                        ))
                    }
                    {
                        roomChatMessages.length === 0 && (
                            <IonItem>
                                <IonLabel>
                                    <h3>No Messages</h3>
                                    <p>No messages has been sent over this chat recently</p>
                                </IonLabel>
                            </IonItem>
                        )
                    }
                </IonContent>
            </IonPage>
    )
}

export const ChatRoomPage = () => {
    return (
        <>
            <ChatRoom />
        </>
    )
}