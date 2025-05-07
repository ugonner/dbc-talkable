import { IonItem, IonLabel } from "@ionic/react";
import { IChat } from "../../shared/interfaces/talkables/chat";
import {
  TalkablePage,
  useTalkableContextStore,
} from "../../contexts/talkables/talkable";
import { formatDate } from "../../shared/helpers";
export interface IChatItemProps {
  chat: IChat;
}
export const ChatItem = ({ chat }: IChatItemProps) => {
  const { userRef, navigateTalkableChatPages } = useTalkableContextStore();

  const converser = chat.users?.find(
    (usr) => usr.userName !== userRef.current?.userName
  );

  return (
    <IonItem>
      <IonLabel
        role="button"
        onClick={() => {
          navigateTalkableChatPages({
            to: TalkablePage.CHAT_ROOM,
            chatRoomId: chat.chatId,
          });
        }}
      >
        <h3>{converser?.userName} </h3>
        <small>
          {chat.lastMessage?.message || ""} |{" "}
          {formatDate(chat.lastMessage?.createdAt as string) || ""}
        </small>
      </IonLabel>
    </IonItem>
  );
};
