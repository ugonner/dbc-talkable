import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  VideoHTMLAttributes,
} from "react";
import { useRTCToolsContextStore } from "../../contexts/rtc";
import { concatArrayBuffers, isObjectEmpty } from "../../shared/helpers";
import { userReactionsEmojis } from "../../shared/DATASETS/user-reaction-emojis";
import { IAuthUserProfile } from "../../shared/interfaces/user";
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonThumbnail,
  IonTitle,
} from "@ionic/react";
import { Socket } from "socket.io-client";
import { CaptionDTO } from "../../shared/dtos/requests/signals";
import { BroadcastEvents } from "../../shared/enums/events.enum";
import { DataProducer } from "mediasoup-client/lib/DataProducer";
import { APIBaseURL, postData } from "../../api/base";
import { closeCircle } from "ionicons/icons";
import { defaultUserImageUrl } from "../../shared/DATASETS/defaults";
import { IProducerUser } from "../../shared/interfaces/socket-user";

export interface ICallVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  mediaStream: MediaStream;
  socket?: Socket;
  room?: string;
  dataProducer?: DataProducer;
}

export const CallVideo = (props: ICallVideoProps) => {
  const storedUser = localStorage.getItem("user");
  const user: IAuthUserProfile = storedUser ? JSON.parse(storedUser) : {};
  let { mediaStream, socket, room, dataProducer, ...videoProps } = props;
  const { videoTurnedOff, userReactionsState, setPinnedProducerUser } =
    useRTCToolsContextStore();

  const videoRef = useRef({} as HTMLVideoElement);
  
  const userReactions = Object.keys(userReactionsEmojis).filter(
    (reaction) => (userReactionsState as { [key: string]: unknown })[reaction]
  );
  
  
  useEffect(() => {
    const setUp = async () => {
      try {
        if (
          mediaStream?.getTracks &&
          mediaStream?.getTracks().length > 0
        ) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.log("Error setting up call video", (error as Error).message);
      }
    };
    setUp();
  }, [mediaStream]);
  return (
    <div onDoubleClick={() => {
      const producer: IProducerUser = {
        isVideoTurnedOff: videoTurnedOff,
        mediaStream,
        userName: user.profile?.userId,
        avatar: user.profile?.avatar
      } as IProducerUser;

      setPinnedProducerUser(producer);
    }}>
      {videoTurnedOff && (
        <div>
          <IonItem color={"light"}>
            <img
              src={user.profile?.avatar || defaultUserImageUrl}
              style={{ width: "100%", height: "auto" }}
            />

            <IonLabel position="stacked">
              <small>{user.profile?.firstName || "You"}</small>
            </IonLabel>
          </IonItem>
        </div>
      )}
      <video
        style={{ width: "100%", height: "auto" }}
        ref={videoRef}
        {...videoProps}
        autoPlay
        playsInline
        hidden={videoTurnedOff}
      ></video>

      {userReactions.map((reaction) => (
        <span>{userReactionsEmojis[reaction][0]}</span>
      ))}
    </div>
  );
};
