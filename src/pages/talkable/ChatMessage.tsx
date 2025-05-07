import {
  IonButton,
  IonIcon,
  IonItem,
  IonList,
  IonPopover,
} from "@ionic/react";
import { IChatMessage } from "../../shared/interfaces/talkables/chat";
import {
  checkmarkDone,
  checkmarkOutline,
  closeCircle,
  ellipsisVertical,
} from "ionicons/icons";
import { formatDate } from "../../shared/helpers";
import { useTalkableContextStore } from "../../contexts/talkables/talkable";
import { useState } from "react";

export const ChatMessage = ({ chatMessage }: { chatMessage: IChatMessage }) => {
  const { transcribeAudioURL } = useTalkableContextStore();
  const [openTranscriptOverlay, setOpenTranscriptOverlay] = useState(false);
  const [transcript, setTranscript] = useState("Loading audio transcript");
  const [openMessageMenuOverlay, setOpenMessageMenuOverlay] = useState(false);

  return (
    <IonItem>
      {chatMessage.attachment?.attachmentUrl && (
        <div slot="end">
          <IonButton
            id={`msg-menu-${chatMessage.message?.replace(" ", "_")}`}
            fill="clear"
            onClick={() => setOpenMessageMenuOverlay(!openMessageMenuOverlay)}
          >
            <IonIcon icon={ellipsisVertical}></IonIcon>
          </IonButton>
        </div>
      )}

      <div>
        <h6>{chatMessage.sender?.userName}</h6>
        <p>
          {chatMessage.message}
          <br />
          {chatMessage.attachment?.attachmentUrl && (
            <audio
              src={`${
                chatMessage.attachment.attachmentUrl
              }`}
              controls
            />
          )}

          <br />
          <small>
            {chatMessage.isViewed ? (
              <IonIcon icon={checkmarkDone}></IonIcon>
            ) : (
              <IonIcon icon={checkmarkOutline}></IonIcon>
            )}
            {formatDate(chatMessage.createdAt)}
          </small>
        </p>
      </div>
      <IonPopover
        trigger={`msg-menu-${chatMessage.message?.replace(" ", "_")}`}
        isOpen={openMessageMenuOverlay}
        onDidDismiss={() => setOpenMessageMenuOverlay(false)}
      >
        <IonList>
          <IonItem>
            <IonButton
              fill="clear"
              onClick={async () => {
                setOpenTranscriptOverlay(true);
                const audioText = await transcribeAudioURL(
                  `${
                    chatMessage.attachment?.attachmentUrl
                  }`
                );
                setTranscript(audioText);
              }}
            >
              Transcribe
            </IonButton>
          </IonItem>
        </IonList>
      </IonPopover>
      <IonPopover
        isOpen={openTranscriptOverlay}
        onDidDismiss={() => setOpenTranscriptOverlay(false)}
      >
        <div>
          <IonItem>
            <div slot="end">
              <IonButton
                fill="clear"
                onClick={() => {
                  setOpenTranscriptOverlay(false);
                  setOpenMessageMenuOverlay(false);
                }}
              >
                <IonIcon icon={closeCircle}></IonIcon>
              </IonButton>
            </div>
          </IonItem>

          <div>
            <h4>Audio Transcript</h4>
            <p>{transcript}</p>
          </div>
        </div>
      </IonPopover>
    </IonItem>
  );
};
