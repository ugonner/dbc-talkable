import { IonButton, IonIcon, IonItem, IonTextarea } from "@ionic/react";
import { useState } from "react";
import { useTalkableContextStore } from "../../contexts/talkables/talkable";
import {
  IChat,
  IChatMessage,
  IChatUser,
} from "../../shared/interfaces/talkables/chat";
import { DBCChatUser } from "./Chats";
import { TalkableChatEvents } from "../../shared/enums/talkables/chat-event.enum";
import { send } from "ionicons/icons";
import { Voicing } from "./Voicing";

export interface IMessagingProps {
  chat: IChat;
}
export const Messaging = ({ chat }: IMessagingProps) => {
  const chatId = chat?.chatId;
  const { socketRef, userRef } = useTalkableContextStore();
  const [message, setMessage] = useState("");
  const [textareaRowHeight, setTextareaRowHeight] = useState(1);
  const textareaColWidth = 70;

  return (
    <div>
      <IonItem>
        <IonTextarea
          fill="outline"
          label="Type in chat"
          labelPlacement="floating"
          name="message"
          onIonInput={(evt) => {
            if (
              message.length % textareaColWidth === 0 &&
              textareaRowHeight <= 5
            ) {
              setTextareaRowHeight((prev) => prev + 1);
            }
            setMessage(evt.detail.value as string);
          }}
          value={message}
          cols={textareaColWidth}
          rows={textareaRowHeight}
        ></IonTextarea>
        <IonButton
          slot="end"
          onClick={async () => {
            try {
              await new Promise((resolve) => {
                const data: IChatMessage = {
                  chatId,
                  message,
                  socketId: socketRef.current?.id,
                  isViewed: false,
                  createdAt: new Date().toISOString(),
                  sender: userRef.current || {
                    userName: "Anonymous",
                    userId: "anonymous",
                    phoneNumber: "07034667861",
                  },
                  receiver:
                    chat?.users.find(
                      (usr) => usr.userId !== userRef.current?.userId
                    ) || (DBCChatUser as IChatUser),
                };
                socketRef?.current?.emit(
                  TalkableChatEvents.CHAT_MESSAGE,
                  data,
                  resolve
                );
              });
              setMessage("");
              setTextareaRowHeight(1);
            } catch (error) {
              console.log(
                "Error sending message in chat",
                (error as Error).message
              );
            }
          }}
          className="icon-only"
          aria-label="send"
        >
          <IonIcon icon={send}></IonIcon>
        </IonButton>
      </IonItem>

      <div slot="start">
        <Voicing chat={chat} />
      </div>
    </div>
  );
};
