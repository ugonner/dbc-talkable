import { Device } from "mediasoup-client";
import { ConnectionState, RtpCapabilities, Transport } from "mediasoup-client/lib/types";
import { Socket } from "socket.io-client";
import { IApiResponse } from "../../../shared/dtos/responses/api-response";
import { ClientEvents, BroadcastEvents } from "../../../shared/enums/events.enum";
import { CreatedTransportDTO } from "../../../shared/dtos/responses/signals";
import { ConnectTransportDTO, CreateDataProducerDTO, CreateProducerDTO, createTransportDTO } from "../../../shared/dtos/requests/signals";

export async function createDevice(socket: Socket, room: string): Promise<Device> {
    const data: IApiResponse<RtpCapabilities> =
      await new Promise((resolve, reject) => {
        socket.emit(
          ClientEvents.GET_ROUTER_RTCCAPABILITIES,
          { room },
          (res: IApiResponse<RtpCapabilities>) => {
            if (res.error) reject(res.message);
            resolve(res);
          }
        );
      });

    const deviceInit = new Device();
    await deviceInit.load({ routerRtpCapabilities: data.data as any });

    return deviceInit
  }

 export async function createProducerTransport(socket: Socket, device: Device, room: string, config: {isAudioTurnedOff: boolean; isVideoTurnedOff: boolean;} ): Promise<Transport> {
    const isProducer = true;
    const dto: createTransportDTO = { room, isProducer };
    const res: IApiResponse<CreatedTransportDTO> = await new Promise(
      (resolve) => {
        socket.emit(
          ClientEvents.CREATE_TRANSPORT,
          dto,
          (res: IApiResponse<CreatedTransportDTO>) => resolve(res)
        );
      }
    );

    if (res.error) throw new Error(res.message);
    if (!res.data) throw new Error("No data returned from server");

      const transportInit = device.createSendTransport(res.data );

      transportInit.on(
        "connect",
        async (data, callBack: Function, errorBack: Function) => {
          await new Promise((resolve) => {
            const dto: ConnectTransportDTO = {
              ...data,
              room,
              transportId: transportInit.id,
              isProducer: true,
            };
            socket.emit(ClientEvents.CONNECT_TRANSPORT, dto, resolve);
          });
          callBack();
        }
      );

      transportInit.on("produce", async (data, callBack, errorBack) => {
        const dto: CreateProducerDTO = {
          ...data,
          room,
          transportId: transportInit.id,
          appData: {
            mediaKind:  data.appData?.mediaKind ?  (data.appData?.mediaKind as "video" | "audio") : data.kind,
            isScreenShare: data.appData?.isScreenShare ?  (data.appData?.isScreenShare as boolean) : false,
            isVideoTurnedOff: data.appData?.isVideoTurnedOff ? true : false,
            isAudioTurnedOff: data.appData?.isAudioTurnedOff ? true : false
          }
        };
        const res: IApiResponse<{ id: string }> = await new Promise(
          (resolve) => {
            socket.emit(ClientEvents.PRODUCE, dto, resolve);
          }
        );
        if (res.error) throw new Error(res.message);
        if (res.data) callBack({ id: res.data.id });
      });

      transportInit.on("producedata", async (data, callBack, errorBack) => {
        const dto: CreateDataProducerDTO = {
          ...data,
          room,
          transportId: transportInit.id,
          appData: {
            mediaKind:  data.appData?.mediaKind ?  (data.appData?.mediaKind as "video" | "audio") : "data",
            isScreenShare: data.appData?.isScreenShare ?  (data.appData?.isScreenShare as boolean) : false 
          }
        };
        const res: IApiResponse<{ id: string }> = await new Promise(
          (resolve) => {
            socket.emit(ClientEvents.PRODUCE_DATA, dto, resolve);
          }
        );
        if (res.error) throw new Error(res.message);
        if (res.data) callBack({ id: res.data.id });
      });

      transportInit.on("connectionstatechange", (data: ConnectionState) => {
        if (data === "closed" || data === "disconnected") {
          socket.emit(BroadcastEvents.PRODUCER_CLOSED, {
            transportId: transportInit.id,
            room,
          });
          console.log("You just lost connection, please check your connection");
        }
      });

      return transportInit;
    
  }

  export async function createConsumerTransport(socket: Socket, device: Device, room: string): Promise<Transport> {
    const isProducer = false;
    const dto: createTransportDTO = { room, isProducer };
    const res: IApiResponse<CreatedTransportDTO> = await new Promise(
      (resolve, reject) => {
        socket.emit(
          ClientEvents.CREATE_TRANSPORT,
          dto,
          (res: IApiResponse<CreatedTransportDTO>) => resolve(res)
        );
      }
    );

    if (res.error) throw new Error(res.message);
    if (!res.data) throw new Error("No data returned from server");
    
    const transportInit = device.createRecvTransport(res.data);

      transportInit.on(
        "connect",
        async (data, callBack: Function, errorBack: Function) => {
          await new Promise((resolve) => {
            const dto: ConnectTransportDTO = {
              ...data,
              isProducer,
              room,
              transportId: transportInit.id,
            };
            socket.emit(ClientEvents.CONNECT_TRANSPORT, dto, resolve);
          });
          callBack();
        }
      );

      return transportInit;
    
  }
