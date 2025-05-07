import { Socket } from "socket.io-client";
import { ClientEvents } from "../../../shared/enums/events.enum";
import { IApiResponse } from "../../../shared/dtos/responses/api-response";
import { IProducers } from "../../../shared/interfaces/socket-user";
import { AppData, DataProducer, Producer, Transport } from "mediasoup-client/lib/types";
import { audioSampleRate } from "../../../pages/talkable/VoiceMessaging";
import { IProducerAppData } from "../../../shared/dtos/requests/signals";

export async function getAllRoomProducers(socket: Socket, room: string): Promise<IProducers> {
    return new Promise((resolve, reject) => {
      socket.emit(
        ClientEvents.GET_ROOM_PRODUCERS,
        { room },
        (res: IApiResponse<IProducers>) => {
          if (res.error) reject(res.message);
          else resolve(res.data as IProducers);
        }
      );
    });
  }

  
  
  export async function startProducing(
    sendingTransport: Transport,
    mediaStream: MediaStream,
    producerAppData: IProducerAppData
  ): Promise<{audioProducer: Producer, videoProducer: Producer} | undefined> {
    try {
      
      const videoTrack = mediaStream.getVideoTracks()[0];
      const audioTrack = mediaStream.getAudioTracks()[0];
      const videoProducer = await sendingTransport.produce({
        track: videoTrack,
        appData: producerAppData as AppData
      });
      const audioProducer = await sendingTransport.produce({
        track: audioTrack,
        appData: producerAppData as AppData
      });
      return {videoProducer, audioProducer};
    } catch (error) {
      console.log((error as Error).message);
    }
  }
  
  export async function startProducingData(
    sendingTransport: Transport
  ): Promise<DataProducer | undefined> {
    try {
      const dataProducer = await sendingTransport.produceData({
        label: "caption"
      });
      return dataProducer;
    } catch (error) {
      console.log( "Error producing data channel", (error as Error).message);
    }
  }
  