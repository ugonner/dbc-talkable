import { LegacyRef, useEffect, useRef, useState } from "react";
import { IProducerUser } from "../../shared/interfaces/socket-user";
import vosker, { Model } from "vosk-browser";
import { useRTCToolsContextStore } from "../../contexts/rtc";
import * as vosk from "vosk-browser";
import { AppBaseUrl } from "../../api/base";
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonPopover,
  IonText,
  IonToast,
} from "@ionic/react";
import { chatbox, closeCircle, diamondSharp } from "ionicons/icons";
import { IChat } from "../../shared/interfaces/talkables/chat";
import { modelPath } from "../../components/conference-room/Captioning";

export interface IVoiceMessagingProps {
  chat: IChat;
}

export const VoiceMessagingRecorder = ({ chat }: IVoiceMessagingProps) => {
  const audioSampleRate = 16000;
  const voskModelRef = useRef<Model>();
  const recognizerRef = useRef<vosk.KaldiRecognizer>();
  const captionsRef = useRef<string[]>([]);
  const [isCaptioning, setIsCaptioning] = useState(false);
  const [openCaptionsOverlay, setOpenCaptionsOverlay] = useState(false);
  const [captions, setCaptions] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioBlobPartsRef = useRef<BlobPart[]>([]);
 const audioElementRef = useRef<HTMLAudioElement>();
 
  const startCaptioning = async () => {
    try {
      mediaRecorderRef.current?.start();
      setIsCaptioning(true);
    } catch (error) {
      console.log("Error in transcripting", (error as Error).message);
    }
  };

  const stopCaptioning = async () => {
    try {
      mediaRecorderRef.current?.stop();
      voskModelRef.current?.terminate();
      setCaptions("");
      setIsCaptioning(false);
    } catch (error) {
      console.log("Error stopping captioning", (error as Error).message);
    }
  };

  const getBlobDataURL = (audioBlob: Blob) => {
    try{
        const reader = new FileReader();
        reader.onloadend = (evt) => {
            console.log("Load end", evt.target?.result)
            if(audioElementRef.current) {
                audioElementRef.current.src = evt.target?.result as string
                setOpenCaptionsOverlay(true);
            }
        }
        reader.onerror = (evt) => console.log("Error loading blob", evt);
    }catch(error){
        console.log("Error reading blob as dataurl", (error as Error).message)
    }
  }
  useEffect(() => {
    const loadRecognixer = async () => {
      try {
       // const modelPath = `/models/vosk-model-small-en-us-0.15.zip`;
        const sampleRate = audioSampleRate;

        const model = await vosk.createModel(modelPath);
        voskModelRef.current = model;
        voskModelRef.current.setLogLevel(-2);
        const rec = new voskModelRef.current.KaldiRecognizer(sampleRate);

        rec.on("result", (message) => {
          const resultText =
            message.event === "result" ? message.result.text : "";
          console.log("trnscrpt result", resultText)
            if (resultText) {
            setCaptions(resultText);
            setOpenCaptionsOverlay(true);
          }
        });
        rec.on("partialresult", (message) => {
          console.log(`Partial result: ${(message as any).result.partial}`);
        });

        recognizerRef.current = rec;

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: audioSampleRate,
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1
          },
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (evt) => {
          audioBlobPartsRef.current.push(evt.data);
        };
        mediaRecorder.onstop = async () => {
          try {
            const audioBlob = new Blob(audioBlobPartsRef.current, {
              type: "audio/wav",
            });
            console.log("after blob creation")
            const arrayBuffer = await audioBlob.arrayBuffer();
            console.log("before float arr creation", arrayBuffer.byteLength)
            const floatArr = new Float32Array(arrayBuffer);
            console.log("past floararr crate")
            const audioBuffer = new AudioBuffer({
              sampleRate: audioSampleRate,
              length: floatArr.length,
              numberOfChannels: 1,
            });
            console.log("before set channnel data")
            audioBuffer.getChannelData(0).set(floatArr);
            console.log("bffe rec")
            recognizerRef.current?.acceptWaveform(audioBuffer);
            getBlobDataURL(audioBlob);
          } catch (error) {
            console.log(
              "Error trying to transibe audio at record stop",
              (error as Error).message
            );
          }
        };
        mediaRecorderRef.current = mediaRecorder;
      } catch (error) {
        console.log("Error at useEffect", (error as Error).message);
      }
    };
    loadRecognixer();
  }, []);

  return (
    <div>
      <IonButton
        className="icon-only"
        onClick={() => {
          if (isCaptioning) stopCaptioning();
          else startCaptioning();
          setIsCaptioning(!isCaptioning);
        }}
        aria-label="toggle captioning"
      >
        <IonText>
          {isCaptioning ? "Turn off captions" : "Turn on Ccaptions"}
        </IonText>
      </IonButton>
      <IonPopover
        isOpen={openCaptionsOverlay}
        onDidDismiss={() => setOpenCaptionsOverlay(false)}
        translate="yes"
        translucent={true}
        style={{ innerWidth: "100%" }}
      >
        <IonItem>
          <IonButton
            role="destructive"
            slot="end"
            className="icon-only"
            onClick={() => setOpenCaptionsOverlay(false)}
            aria-label="close caption"
          >
            <IonIcon icon={closeCircle}></IonIcon>
          </IonButton>
        </IonItem>
        <p>{captions}</p>
      </IonPopover>
      {/* uses toast's duration to dismiss popover  */}
    

      <IonPopover
      isOpen={openCaptionsOverlay}
      onDidDismiss={() => setOpenCaptionsOverlay(false)}
      >
        <div>
            <IonItem>
                <audio ref={audioElementRef as LegacyRef<HTMLAudioElement>} controls slot="start"/>
                <IonButton
                fill="clear"
                onClick={() => setOpenCaptionsOverlay(false)}
                >
                    <IonIcon icon={closeCircle}></IonIcon>
                </IonButton>
            </IonItem>
            <IonItem>
                <IonLabel>
                    <h3>Captions</h3>
                    <p>{captions}</p>
                </IonLabel>
            </IonItem>
        </div>
      </IonPopover>
    </div>
  );
};
