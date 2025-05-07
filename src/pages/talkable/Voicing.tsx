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
} from "@ionic/react";
import { closeCircle } from "ionicons/icons";
import { useTalkableContextStore } from "../../contexts/talkables/talkable";
import { IChat, IChatMessage, IChatUser } from "../../shared/interfaces/talkables/chat";
import { userReactionsEmojis } from "../../shared/DATASETS/user-reaction-emojis";
import { TalkableChatEvents } from "../../shared/enums/talkables/chat-event.enum";
import { modelPath } from "../../components/conference-room/Captioning";

export interface IVoicingProps {
  chat: IChat;
}

export const Voicing = ({chat}: IVoicingProps) => {
  const audioSampleRate = 16000;
  const {socketRef, userRef} = useTalkableContextStore();
  
  const voskModelRef = useRef<Model>();
  const recognizerRef = useRef<vosk.KaldiRecognizer>();
  const audioWorkletRef = useRef<AudioWorkletNode | null>();
  const audioContextRef = useRef<AudioContext | null>();

  const [isVoicing, setIsVoicing] = useState(false);
  const [openCaptionsOverlay, setOpenCaptionsOverlay] = useState(false);
  const [captions, setCaptions] = useState("");
  const audioFloatArrDataRef = useRef<number[]>([]);
  const audioElementRef = useRef<HTMLAudioElement>();
  const [isActivelyProcessing, setIsActivelyProcessing] = useState(false);
  const streamRef = useRef<MediaStream | null>();
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>();
  const mediaSourceRef = useRef<MediaStreamAudioSourceNode | null>();
  const captionsArrRef = useRef<string[]>([]);

  const sendVoiceCaptionsMessage = async () => {
    try{
      const msg: IChatMessage = {
        chatId: chat.chatId,
        message: captionsArrRef.current.join("\r\n"),
        sender: userRef.current as IChatUser,
        receiver: chat?.users.find((usr) => usr.userId !== userRef.current?.userId) as IChatUser,
        isViewed: false,
        createdAt: new Date().toISOString()
      };
      await new Promise((resolve, reject) => {
        socketRef.current?.emit(TalkableChatEvents.CHAT_MESSAGE, msg, resolve);
      });
      captionsArrRef.current = [];
      

    }catch(error){
      console.log("Error sending voice captions message", (error as Error).message);
    }
  }

  const startCaptioning = async () => {
    try {
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
          const floatArr: number[] = evt.data;
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

      audioFloatArrDataRef.current = [];
      await closeOut();
      setIsVoicing(false);
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
        //const modelPath = `/models/vosk-model-small-en-us-0.15.zip`;
        const sampleRate = audioSampleRate;

        const modell = await vosk.createModel(modelPath);
        modell.setLogLevel(1);
        const rec = new modell.KaldiRecognizer(sampleRate);

        rec.on("result", (message) => {
          const resultText =
            message.event === "result" ? message.result.text : "";
          if (resultText) {
            captionsArrRef.current.push(resultText);
            setCaptions(resultText);
            setIsActivelyProcessing(false);
            setOpenCaptionsOverlay(true);
          }
        });
        // rec.on("partialresult", (message) => {
        //   console.log(`Partial result: ${(message as any).result.partial}`);
        // });

        recognizerRef.current = rec;
      } catch (error) {
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
  return (
    <div>
      <IonButton
        className="icon-only"
        disabled={isActivelyProcessing}
        onClick={() => {
          if (isVoicing) stopCaptioning();
          else startCaptioning();
          setIsVoicing(!isVoicing);
        }}
      >
        <IonText>
          {isVoicing ? "Stop Voicing" : "Start Voicing"}
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
