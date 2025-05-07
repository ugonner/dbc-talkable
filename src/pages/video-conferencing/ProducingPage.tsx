import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonRow,
  IonSpinner,
  IonText,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { CallVideo } from "../../components/video/CallVideo";
import { RouteComponentProps, useHistory, useParams } from "react-router-dom";
import { useRTCToolsContextStore } from "../../contexts/rtc";
import { Dispatch, useEffect, useState } from "react";
import {
  toggleAudio,
  toggleVIdeo,
} from "../../utils/rtc/mediasoup/functionalities";
import { Socket } from "socket.io-client";
import { BroadcastEvents } from "../../shared/enums/events.enum";
import { mic, micOff, videocam, videocamOff } from "ionicons/icons";

export interface IProducingPageProps {
  joinHandler?: Function;
  canJoin: boolean;
}

export const ProducingPage = (props: IProducingPageProps) => {
  const {
    setUserMediaStream,
    userMediaStream,
    videoTurnedOff,
    setVideoTurnedOff,
    setAudioTurnedOff,
    audioTurnedOff,
    producerAppDataRef,
  } = useRTCToolsContextStore();
  const [presentToast] = useIonToast();
  const [showToolbar, setShowTaskbar] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!navigator.mediaDevices)
          throw new Error("Your device does not support media sharing");
        const mediaStream = await navigator.mediaDevices?.getUserMedia({
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1,
            sampleRate: 16000,
          },
        });
        if (mediaStream)
          mediaStream.getVideoTracks()[0].enabled = !(Boolean(videoTurnedOff));
          mediaStream.getAudioTracks()[0].enabled = !(Boolean(audioTurnedOff));
          setUserMediaStream(
            mediaStream as MediaStream & Dispatch<MediaStream>
          );

        setShowTaskbar(true);
      } catch (error) {
        console.log("Error starting producing", (error as Error).message);
        presentToast((error as Error).message, 3000);
        setShowTaskbar(true);
      }
    })();
  }, []);

  const [openJoinRequestSpinner, setOpenJinRequestSpinner] = useState(false);

  return (
    <div>
      <IonGrid>
        <IonRow>
          <IonCol sizeMd="6" sizeSm="12">
            <CallVideo mediaStream={userMediaStream as MediaStream} />
          </IonCol>
          <IonCol sizeMd="6" sizeSm="12">
            <h3>Have A Preview</h3>
            <p>Take a preview of your looks into this event.</p>
            <p>
              When you are set to join click the "join" or "ask to join" button.
              If you clicked the "ask to join" button, Please wait for an admin
              to accept you into the event. If no admin is present in the event,
              sorry you can not be admitted in.
            </p>

            {showToolbar && (
              <IonToolbar>
                <IonItem>
                  <IonButton
                    fill="clear"
                    size="large"
                    onClick={async () => {
                      toggleAudio(
                        userMediaStream as MediaStream,
                        setAudioTurnedOff,
                        producerAppDataRef
                      );
                      
                    }}
                    aria-label={
                      audioTurnedOff ? "turn audio on" : "turn audio off"
                    }
                  >
                    <IonIcon icon={audioTurnedOff ? micOff : mic}></IonIcon>
                  </IonButton>

                  <IonButton
                    fill="clear"
                    size="large"
                    onClick={() => {
                      toggleVIdeo(
                        userMediaStream as MediaStream,
                        setVideoTurnedOff,
                        producerAppDataRef
                      );
                      
                    }}
                    aria-label={
                      videoTurnedOff ? "turn video on" : "turn video off"
                    }
                  >
                    <IonIcon
                      icon={videoTurnedOff ? videocamOff : videocam}
                    ></IonIcon>
                  </IonButton>

                  <IonButton
                    fill="clear"
                    slot="end"
                    onClick={async () => {
                      if (props.joinHandler) await props.joinHandler();
                      if (!props.canJoin) setOpenJinRequestSpinner(true);
                    }}
                  >
                      {props.canJoin
                        ? "Join"
                        : !openJoinRequestSpinner
                        ? "Ask to join"
                        : "waiting to be admitted..."}
                    
                  </IonButton>
                </IonItem>
              </IonToolbar>
            )}
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};
