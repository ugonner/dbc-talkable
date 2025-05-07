import { LegacyRef, useEffect, useRef, useState } from "react";
import { Model } from "vosk-browser";
import * as vosk from "vosk-browser";
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonPopover,
  IonSegment,
  IonSegmentButton,
  IonText,
  useIonToast,
} from "@ionic/react";
import { closeCircle } from "ionicons/icons";
import { useTalkableContextStore } from "../../contexts/talkables/talkable";
import { IChat, IChatMessage, IChatUser, IMessageAttachment } from "../../shared/interfaces/talkables/chat";
import { TalkableChatEvents } from "../../shared/enums/talkables/chat-event.enum";
import audioBufferToWav from "audiobuffer-to-wav";

import { IApiResponse } from "../../shared/dtos/responses/api-response";
import { useAsyncHelpersContext } from "../../contexts/async-helpers";
import { modelPath } from "../../components/conference-room/Captioning";
import { APIBaseURL } from "../../api/base";
        
export interface IVoiceMessagingProps {
  chat: IChat;
}
export const audioSampleRate = 16000;

export const VoiceMessaging = ({chat}: IVoiceMessagingProps) => {
  const audioSampleRate = 16000;
  const {socketRef, userRef} = useTalkableContextStore();
  
  const voskModelRef = useRef<Model>();
  const recognizerRef = useRef<vosk.KaldiRecognizer>();
  const audioWorkletRef = useRef<AudioWorkletNode | null>();
  const audioContextRef = useRef<AudioContext | null>();

  const [presentToast] = useIonToast();
  const [isVoiceMessaging, setIsVoiceMessaging] = useState(false);
  const [openCaptionsOverlay, setOpenCaptionsOverlay] = useState(false);
  const [captions, setCaptions] = useState("");
  const audioFloatArrDataRef = useRef<number[]>([]);
  const audioElementRef = useRef<HTMLAudioElement>();
  const [isActivelyProcessing, setIsActivelyProcessing] = useState(false);
  const streamRef = useRef<MediaStream | null>();
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>();
  const mediaSourceRef = useRef<MediaStreamAudioSourceNode | null>();
  const captionsArrRef = useRef<string[]>([]);
  const {setLoading} = useAsyncHelpersContext();
  
  const uploadAudioData = async (): Promise<IMessageAttachment> => {
    
    if(!audioContextRef || !audioContextRef.current) audioContextRef.current = new (AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = audioContextRef.current.createBuffer(1, audioFloatArrDataRef.current.length, audioSampleRate);
    audioBuffer.getChannelData(0).set(audioFloatArrDataRef.current);
    
    const audioArr: ArrayBuffer = audioBufferToWav(audioBuffer);
    const audioBlob = new Blob([audioArr], {type: "audio/wav"});
    const formData = new FormData();
    formData.append("file", audioBlob);
    
    const res = await fetch(`${APIBaseURL}/file-upload`, {
      method: "post",
      body: formData,
    });
    const resBody: IApiResponse<IMessageAttachment> = await res.json();
    if(!res.ok) throw resBody;
    return resBody.data as IMessageAttachment;

  } 

  

  const sendVoiceCaptionsMessage = async () => {
    try{
      let attachment: IMessageAttachment;
      attachment = await uploadAudioData();
      const msg: IChatMessage = {
        chatId: chat.chatId,
        message: captionsArrRef.current.join("\r\n"),
        sender: userRef.current as IChatUser,
        receiver: chat?.users.find((usr) => usr.userId !== userRef.current?.userId) as IChatUser,
        isViewed: false,
        createdAt: new Date().toISOString(),
        attachment

      };
      await new Promise((resolve, reject) => {
        socketRef.current?.emit(TalkableChatEvents.CHAT_MESSAGE, msg, resolve);
      });

      captionsArrRef.current = [];
      audioFloatArrDataRef.current = [];
      

    }catch(error){
      console.log("Error sending voice captions message", (error as Error).message);
    }
  }

  const startCaptioning = async () => {
    try {
      setIsVoiceMessaging(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: audioSampleRate,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      if (!audioContextRef.current || !audioWorkletRef.current) {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)({ sampleRate: audioSampleRate });
        audioContextRef.current = audioContext;
        await audioContextRef.current.audioWorklet.addModule(
          "/worklet/PCMBatch-processor.js"
        );
        const audioWorkletNode = new AudioWorkletNode(
          audioContextRef.current,
          "pcm-batch-processor"
        );

        audioWorkletRef.current = audioWorkletNode;
        audioWorkletRef.current = audioWorkletNode;
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      audioWorkletRef.current.port.onmessage = (evt) => {
        try {
          audioFloatArrDataRef.current = [...audioFloatArrDataRef.current, evt.data];
          const floatArr: number[] = evt.data;
          audioFloatArrDataRef.current = [...audioFloatArrDataRef.current, ...floatArr]
          const audioBufferData = audioContextRef.current?.createBuffer(
            1,
            floatArr.length,
            audioSampleRate
          );
          audioBufferData?.getChannelData(0).set(floatArr);
          recognizerRef.current?.acceptWaveform(audioBufferData as AudioBuffer);
    
        } catch (error) {
          console.log("Error in on message", (error as Error).message);
        }
      };
      source.connect(audioWorkletRef.current);
      audioWorkletRef.current.connect(audioContextRef.current.destination);
    } catch (error) {
      console.log("Error in transcripting", (error as Error).message);
    }
  };

  const stopCaptioning = async () => {
    try {
        await closeOut();
      setIsVoiceMessaging(false);
    } catch (error) {
      console.log("Error stopping captioning", (error as Error).message);
    }
  };

  
  const startCaptioningLegacy = async () => {
    try {
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            sampleRate: audioSampleRate,
            channelCount: 1,
            noiseSuppression: true,
            echoCancellation: true,
          },
        });
        streamRef.current = stream;
      }

      if (!audioContextRef.current) {
        const audioContext = new (AudioContext ||
          (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
      }

      const source = audioContextRef.current?.createMediaStreamSource(
        streamRef.current
      );
      const processor = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1
      );
      processor.onaudioprocess = (evt) => {
        recognizerRef.current?.acceptWaveform(evt.inputBuffer);
      };
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      mediaSourceRef.current = source;
      scriptProcessorRef.current = processor;
    } catch (error) {
      console.log("Error using script procesor");
    }
  };

  const stopCaptioningLegacy = async () => {
    try {
      
      await closeOut();
    } catch (error) {
      console.log(
        "Error stopping captioning using script processor",
        (error as Error).message
      );
    }
  };
  useEffect(() => {
    const loadRecognixer = async () => {
      try {
        const sampleRate = audioSampleRate;
        setLoading({isLoading: true, loadingMessage: ""})
      
        const modell = await vosk.createModel(modelPath);
        modell.setLogLevel(1);
        const rec = new modell.KaldiRecognizer(sampleRate);

        rec.on("result", async (message) => {
          const resultText =
            message.event === "result" ? message.result.text : "";
          if (resultText) {
            captionsArrRef.current.push(resultText);
            setCaptions(resultText);
            setIsActivelyProcessing(false);
            if(captionsArrRef.current.length === 10){
                await stopAndSendVoiceMessage();
                return;
            }
            //setOpenCaptionsOverlay(true);
          }
        });
        // rec.on("partialresult", (message) => {
        //   console.log(`Partial result: ${(message as any).result.partial}`);
        // });

        recognizerRef.current = rec;
        setLoading({isLoading: false, loadingMessage: ""})
      
      } catch (error) {
        setLoading({isLoading: false, loadingMessage: ""})
      
        console.log("Error at useEffect", (error as Error).message);
      }
    };
    loadRecognixer();

    return () => {
      voskModelRef.current?.terminate();
      closeOut();

    }
  }, []);

  const closeOut = async () => {
    try{

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioWorkletRef.current) {
        audioWorkletRef.current.port.close();
        audioWorkletRef.current.disconnect();
      }
  
      if(mediaSourceRef.current){
        mediaSourceRef.current.disconnect();
      }
      if(scriptProcessorRef.current){
        scriptProcessorRef.current.disconnect();
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        await audioContextRef.current.close();
      }
  
      streamRef.current = null;
      audioWorkletRef.current = null;
  
      mediaSourceRef.current = null;
      scriptProcessorRef.current = null;
  
      audioContextRef.current = null;
    }catch(error){
      console.log("Error closing out audio processing resources", (error as Error).message)
    }
  };

  const stopAndSendVoiceMessage = async () => {
    if(captionsArrRef.current.length === 0 && (!captionsArrRef.current.join("")) ){
        presentToast("No message has been transcribed yet, Re-speak", 5000);
        return;
    }
    //createWAVFile(audioFloatArrDataRef.current, audioSampleRate);
    await stopCaptioning();
    await sendVoiceCaptionsMessage();
  }

  return (
    <div>
      <IonButton
        className="icon-only"
        disabled={isActivelyProcessing}
        onClick={async () => {
          if (isVoiceMessaging) await stopAndSendVoiceMessage();
          else await startCaptioning();
          //setIsVoiceMessaging(!isVoiceMessaging);
        }}
        
      >
        <IonText>
          {isVoiceMessaging ? "Stop Talking And Send" : "Start talking"}
        </IonText>
      </IonButton>

      <IonButton
      fill="clear"
      onClick={() => {captionsArrRef.current = []; audioFloatArrDataRef.current = [];}}
      >
        Clear voice
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
        translucent={true}
      >
        <div>
          <IonItem>
            <IonButton
              slot="end"
              fill="clear"
              onClick={() => setOpenCaptionsOverlay(false)}
            >
              <IonIcon icon={closeCircle}></IonIcon>
            </IonButton>
            
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>{captions}</p>
            </IonLabel>
          </IonItem>
          
          <IonSegment>
            <IonSegmentButton
            onClick={async () => {
              await stopCaptioning();
              await sendVoiceCaptionsMessage();
              setOpenCaptionsOverlay(false);
            }}
            >
              Send Message
            </IonSegmentButton>
            <IonSegmentButton
            onClick={ async () => {
              await stopCaptioning();
              captionsArrRef.current = [];
              setOpenCaptionsOverlay(false);
            }}
            >
              stop and clear
            </IonSegmentButton>
          </IonSegment>
        </div>
      </IonPopover>
    </div>
  );
};
