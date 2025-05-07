import { useEffect, useState } from "react";
import {
  IProducerUser,
  UserActions,
} from "../../shared/interfaces/socket-user";
import { Socket } from "socket.io-client";
import {
  ToggleProducerStateDTO,
  UserMediaToggleActionType,
  UserReactionsDTO,
} from "../../shared/dtos/responses/signals";
import { BroadcastEvents } from "../../shared/enums/events.enum";
import {
  IonButton,
  IonIcon,
  IonItem,
  IonList,
  IonPopover,
  useIonAlert,
} from "@ionic/react";
import { userReactionsEmojis } from "../../shared/DATASETS/user-reaction-emojis";
import {
  ellipseOutline,
  mic,
  micOff,
  powerOutline,
  thumbsDown,
  thumbsUp,
  videocam,
  videocamOff,
} from "ionicons/icons";
import { IRoomContext } from "../../shared/interfaces/room";

export interface IRoomParticipantsProp {
  roomParticipants: IProducerUser[];
  socket: Socket;
  reactionType?: UserActions;
  userMediaToggleAction?: "muted" | "videoTurnedOff";
  room: string;
  isAdmin: boolean;
}
export const RoomParticipants = ({
  roomParticipants,
  socket,
  reactionType,
  room,
  isAdmin,
  userMediaToggleAction,
}: IRoomParticipantsProp) => {
  let participants: IProducerUser[] = reactionType
    ? roomParticipants.filter((user) => user[reactionType as UserActions])
    : roomParticipants;
  participants = userMediaToggleAction
    ? participants?.filter((user) => {
        if (userMediaToggleAction === "muted") return user?.isAudioTurnedOff;
        else if (userMediaToggleAction === "videoTurnedOff")
          return user?.isVideoTurnedOff;
      })
    : participants;

  reactionType = reactionType || ("happy" as UserActions);

  const [presentAlert, dismissAlert] = useIonAlert();

  const displayAlert = (
    message: string,
    data: IProducerUser | undefined,
    actionType: "remove-user" | "user-reaction" | "special-presenter",
    action?: UserMediaToggleActionType
  ) => {
    if (!user) return;
    presentAlert({
      message,
      buttons: [
        {
          text: "Continue",
          handler: async () => {
            if (actionType === "remove-user") {
              socket.emit(BroadcastEvents.LEAVE_ROOM, {
                socketId: user.socketId,
              });
            } else if (actionType === "user-reaction") {
              if (action) toggleMedia(data as IProducerUser, action);
              else toggleReaction(data as IProducerUser);
              dismissAlert();
            } else if (actionType === "special-presenter") {
              try {
                const data: IRoomContext = {
                  room,
                  hasSpecialPresenter: !roomContext?.hasSpecialPresenter,
                  specialPresenterSocketId:
                    roomContext?.specialPresenterSocketId === user.socketId
                      ? null
                      : user.socketId,
                } as IRoomContext;
                await new Promise((resolve) => {
                  socket.emit(
                    BroadcastEvents.ROOM_CONTEXT_MODIFICATION,
                    data,
                    resolve
                  );
                });
              } catch (error) {
                console.log(
                  "Error setting special presenter",
                  (error as Error).message
                );
              }
            }
            dismissAlert();
          },
        },
        {
          text: "Cancel",
          handler: () => dismissAlert(),
        },
      ],
    });
  };

  const toggleReaction = (user: IProducerUser) => {
    const data: UserReactionsDTO = {
      socketId: user.socketId,
      room,
      action: reactionType as UserActions,
      actionState: user[reactionType] ? false : true,
    };
    socket?.emit(BroadcastEvents.USER_REACTION, data);
  };

  const toggleMedia = (
    user: IProducerUser,
    action: UserMediaToggleActionType
  ) => {
    const data: ToggleProducerStateDTO = {
      socketId: user?.socketId,
      action,
      room,
    };
    socket?.emit(BroadcastEvents.TOGGLE_PRODUCER_STATE, data);
  };

  const [roomContext, setRoomContext] = useState<IRoomContext>();
  const [openActionsOerlay, setOpenActionsOerlay] = useState(false);
  const [user, setUser] = useState<IProducerUser>();

  useEffect(() => {
    (async () => {
      try {
        const res = await new Promise((resolve) => {
          socket.emit(BroadcastEvents.GET_ROOM_CONTEXT, { room }, resolve);
        });
        setRoomContext(res as IRoomContext);
      } catch (error) {
        console.log((error as Error).message);
      }
    })();
  });
  return (
    <div>
      <h1>{reactionType ? reactionType : ""}</h1>

      <IonList>
        {participants.map((user, i) => (
          <IonItem key={i}>
            {user.userName} | {user.userId}
            <IonButton
              slot="end"
              onClick={() => {
                setUser(user);
                setOpenActionsOerlay(true);
              }}
              className="ICON-ONLY"
              id="actions-overlay-toggler"
            >
              <IonIcon icon={ellipseOutline}></IonIcon>
            </IonButton>
          </IonItem>
        ))}
      </IonList>
      <IonPopover
        isOpen={openActionsOerlay}
        onDidDismiss={() => setOpenActionsOerlay(false)}
        trigger="actions-overlay-toggler"
      >
        {user ? (
          <div>
            <IonItem>
                
            <IonButton
              slot="start"
              onClick={() => {
                if (isAdmin)
                  displayAlert("Toggle User's Reaction", user, "user-reaction");
              }}
            >
              {(user as unknown as { [key: string]: unknown })[
                `${reactionType}`
              ]
                ? userReactionsEmojis[`${reactionType}`][0] + `Remove from ${reactionType}`
                : userReactionsEmojis[`${reactionType}`][1] + `Add to ${reactionType}`}
            </IonButton>
            </IonItem>
            <IonItem>
                
            <IonButton
              slot="start"
              className="icon-only"
              onClick={() => {
                const action: UserMediaToggleActionType = user.isAudioTurnedOff
                  ? "unMute"
                  : "mute";
                if (isAdmin)
                  displayAlert(
                    `${action} user `,
                    user,
                    "user-reaction",
                    action
                  );
              }}
            >
              {user.isAudioTurnedOff ? "UnMute" : "Mute"}
            </IonButton>
            </IonItem>
            <IonItem>
                
            <IonButton
              slot="start"
              className="icon-only"
              onClick={() => {
                const action: UserMediaToggleActionType = user.isVideoTurnedOff
                  ? "turnOnVideo"
                  : "turnOffVideo";
                if (isAdmin)
                  displayAlert(
                    `${
                      user.isVideoTurnedOff
                        ? "Turn On User's Video"
                        : "Turn Off User's Video"
                    } user `,
                    user,
                    "user-reaction",
                    action
                  );
              }}
            > {user.isVideoTurnedOff ? "Turn On Vieo" : "Turn Off Video"}
            </IonButton>
            </IonItem>
            <IonItem>
              <IonButton
                slot="start"
                onClick={() =>
                  displayAlert(
                    `Manage Special Presenter Mode`,
                    user,
                    "special-presenter"
                  )
                }
                aria-label={
                  roomContext?.specialPresenterSocketId === user.socketId
                    ? "Remove as special presenter"
                    : "Make special presenter"
                }
              >
                {roomContext?.specialPresenterSocketId === user.socketId
                  ? "Assign As Special Presenter"
                  : "Remove As Special Presenter"}
              </IonButton>
            </IonItem>
            <IonItem>
              <IonButton
                slot="start"
                onClick={() =>
                  displayAlert(
                    `Remove ${user.userName} from the meeting`,
                    user,
                    "remove-user"
                  )
                }
                aria-label={"Remove participant"}
                
              >
                 Remove
              </IonButton>
            </IonItem>
          </div>
        ) : (
          <></>
        )}
      </IonPopover>
    </div>
  );
};
