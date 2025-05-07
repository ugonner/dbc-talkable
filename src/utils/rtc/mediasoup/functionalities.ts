import { Socket } from "socket.io-client";
import { ClientEvents } from "../../../shared/enums/events.enum";
import { SetStateAction, Dispatch, MutableRefObject } from "react";
import { IProducers } from "../../../shared/interfaces/socket-user";
import { IApiResponse } from "../../../shared/dtos/responses/api-response";
import { APIBaseURL, getData } from "../../../api/base";
import { ICanJoinAs, IRoom } from "../../../shared/interfaces/room";
import {
  IProducerAppData,
  JoinRoomDTO,
} from "../../../shared/dtos/requests/signals";
export function toggleAudio(
  userMediaStream: MediaStream,
  setAudioTurnedOff: SetStateAction<Dispatch<boolean>>,
  producerAppDataRef: MutableRefObject<IProducerAppData>
) {
  const newTrackState = !userMediaStream.getAudioTracks()[0].enabled;
  userMediaStream.getAudioTracks()[0].enabled = newTrackState;

  producerAppDataRef.current = {
    ...producerAppDataRef.current,
    isAudioTurnedOff: !newTrackState,
  };
  setAudioTurnedOff(!newTrackState as boolean & Dispatch<boolean>);
}

export function toggleVIdeo(
  userMediaStream: MediaStream,
  setVideoTurnedOff: SetStateAction<Dispatch<boolean>>,
  producerAppDataRef: MutableRefObject<IProducerAppData>
) {
  const newTrackState = !userMediaStream.getVideoTracks()[0].enabled;
  userMediaStream.getVideoTracks()[0].enabled = newTrackState;

  producerAppDataRef.current = {
    ...producerAppDataRef.current,
    isVideoTurnedOff: !newTrackState,
  };

  setVideoTurnedOff(!newTrackState as boolean & Dispatch<boolean>);
}

export async function joinRoom(socket: Socket, dto: JoinRoomDTO) {
  return await new Promise((resolve) => {
    socket.emit(ClientEvents.JOIN_ROOM, dto, resolve);
  });
}

export function stopMediaTracks(userMediaStream: MediaStream) {
  try {
    const tracks = userMediaStream?.getTracks();
    tracks?.forEach((track) => {
      track.enabled = false;
      track.stop();
    });
  } catch (error) {
    console.log("Error stopping media tracks", (error as Error).message);
  }
}

export async function getRoomAdmins(
  socket: Socket,
  room: string
): Promise<IProducers | undefined> {
  const res: IApiResponse<IProducers> = await new Promise((resolve) => {
    socket.emit(ClientEvents.GET_ROOM_ADMINS, { room }, resolve);
  });
  if (res.error) throw new Error(res.message);
  return res.data;
}

export async function isRoomAdmin(
  socket: Socket,
  room: string,
  userId: string
): Promise<boolean> {
  const roomAdmins = await getRoomAdmins(socket, room);
  if (roomAdmins) {
    Object.values(roomAdmins).find((roomAdmin) => roomAdmin.userId === userId);
    return true;
  }
  return false;
}

export async function canJoinRoom(
  userId: string,
  roomId: string
): Promise<ICanJoinAs | undefined> {
  try {
    const canJoinAs: ICanJoinAs = {};

    const room = await getData<IRoom>(`${APIBaseURL}/room/${roomId}`);
    console.log("room", room.owner, userId);
    if (room?.owner?.userId === userId) canJoinAs.isOwner = true;
    if (room?.invitees?.find((user) => user.userId === userId))
      canJoinAs.isInvitee = true;
    const aidServiceProvided = room?.aidServiceProviders?.find(
      (user) => user.userId === userId
    );
    if (aidServiceProvided) canJoinAs.isAidServiceProvider = true;
    if (aidServiceProvided?.aidServiceId === 2)
      canJoinAs.isSpecialPresenter = true;

    if (
      canJoinAs.isOwner ||
      canJoinAs.isInvitee ||
      canJoinAs.isAidServiceProvider ||
      canJoinAs.isSpecialPresenter
    )
      return canJoinAs;
    return;
  } catch (error) {
    console.log("Error checking if user can join", (error as Error).message);
    return;
  }
}
