import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  VideoHTMLAttributes,
} from "react";
import { useRTCToolsContextStore } from "../../contexts/rtc";
import { IProducerUser } from "../../shared/interfaces/socket-user";
import { IonItem, IonLabel, IonThumbnail } from "@ionic/react";
import { userReactionsEmojis } from "../../shared/DATASETS/user-reaction-emojis";
import { defaultUserImageUrl } from "../../shared/DATASETS/defaults";

export interface ICallVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  mediaStream?: MediaStream;
  containerWidth?: string;
  containerHeight?: string;
  producerUser?: IProducerUser;
}
export const ConsumingVideo = ({ producerUser, ...props }: ICallVideoProps) => {
  const {setPinnedProducerUser} = useRTCToolsContextStore();

  let { mediaStream, containerHeight, containerWidth, ...videoProps } = props;
  const userReactions = producerUser
    ? Object.keys(userReactionsEmojis).filter(
        (reaction) =>
          (producerUser as unknown as { [key: string]: unknown })[reaction]
      )
    : null;
  containerHeight = containerHeight ? containerHeight : (props.width as string);
  const videoRef = useRef({} as HTMLVideoElement);
  useEffect(() => {
    if (props.mediaStream) {
      const videoElem = videoRef.current as HTMLVideoElement;
      if (videoElem) videoElem.srcObject = props.mediaStream;
    }
  }, []);
  return (
    <div>
      {producerUser?.isVideoTurnedOff && (
        <div onDoubleClick={() => setPinnedProducerUser(producerUser)}>
          <IonItem>
            <IonThumbnail>
              <img
                src={
                  producerUser?.avatar
                    ? producerUser.avatar
                    : defaultUserImageUrl
                }
                alt={`${producerUser?.userName} image`}
                style={{ width: "100%", height: "auto" }}
              />
            </IonThumbnail>
            <IonLabel position="stacked">
              <h4>{producerUser?.userName}</h4>
              <p>{producerUser?.userName} turned off video</p>
            </IonLabel>
          </IonItem>
        </div>
      )}
      <video
        {...videoProps}
        width={"100%"}
        height={"auto"}
        ref={videoRef}
        autoPlay
        playsInline
        hidden={producerUser?.isVideoTurnedOff}
      ></video>
      <div>
        {userReactions?.map((reaction) => (
          <span>{userReactionsEmojis[reaction][0]}</span>
        ))}
      </div>
    </div>
  );
};
