import { Socket } from "socket.io-client";
import { BroadcastEvents } from "./enums/events.enum";
import { CaptionDTO } from "./dtos/requests/signals";


export const sendOutAudioStream = async (stream: MediaStream, socket: Socket, room: string) => {
    
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
audioContext.audioWorklet.addModule
    await audioContext?.audioWorklet.addModule(`/worklet/chunked-processor.js`);
    const processor = new AudioWorkletNode(audioContext, 'chunked-audio-processor');

    processor.port.onmessage = (evt) => {
      
      if(evt.data){
        const data: CaptionDTO = {
          room,
          buffer:  evt.data
        }
        socket.emit(BroadcastEvents.CAPTION, data);
      }
      
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

}

