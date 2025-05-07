import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonToggle,
  useIonAlert,
} from "@ionic/react";
import { Socket } from "socket.io-client";
import { IAccessibilityPreferences, IProducerUser } from "../../shared/interfaces/socket-user";
import { formatCamelCaseToSentence, presentToast } from "../../shared/helpers";
import { BroadcastEvents } from "../../shared/enums/events.enum";
import { AccessibilityPreferenceDTO } from "../../shared/dtos/requests/signals";
import {
  AccessibilityPriority,
  IRoomContext,
} from "../../shared/interfaces/room";
import { useEffect, useState } from "react";
import { useRTCToolsContextStore } from "../../contexts/rtc";
import { APIBaseURL, getData, postData } from "../../api/base";
import { IAidService } from "../../shared/interfaces/aid-service.interface";
import { IQueryResult } from "../../shared/interfaces/api-response";
import { briefcase } from "ionicons/icons";

export interface IRoomMenuProps {
  socket: Socket;
  room: string;
}

export const RoomMenu = ({ socket, room }: IRoomMenuProps) => {
  const { accessibilityPreferences, setAccessibilityPreferences } =
    useRTCToolsContextStore();
  const accessibilityPreferenceSample: IAccessibilityPreferences = {
    usesTextualCommunication:
      accessibilityPreferences?.usesTextualCommunication,
  };
  const [aidServices, setAidServices] = useState<IAidService[]>([]);
  const [displayAlert, dismissAlert] = useIonAlert();

  const [roomContext, setRoomContext] = useState<IRoomContext>();
  const getRoomContext = async () => {
    try {
      const roomContxt = await new Promise((resolve) => {
        socket.emit(BroadcastEvents.GET_ROOM_CONTEXT, { room }, resolve);
      });
      setRoomContext(roomContxt as IRoomContext);
    } catch (error) {
      console.log("Error gettig room context", (error as Error).message);
    }
  };

  const getAidServices = async () => {
    try {
      const res = await getData<IQueryResult<IAidService>>(`${APIBaseURL}/aid-service`);
      setAidServices(res.data);
    } catch (error) {
      console.log("Error getting aid service list", (error as Error).message);
      presentToast(`Error fetching aid service list`);
    }
  };
  useEffect(() => {
    (async () => {
      await getRoomContext();
      await getAidServices();
    })();
  });

  return (
    <div>
      <IonItem>
        <small slot="end" style={{fontWeight: "bold"}}> <IonIcon icon={briefcase}></IonIcon> &nbsp; {room}</small>
      </IonItem>
      <h4>Accessibility Preferences</h4>
      <small>Request for accessibility features, If you have difficulty hearing or listening on this event, you should request or identify that you use textual communication by selecting from below option.</small>
      <IonList>
        {Object.keys(accessibilityPreferenceSample).map((field, i) => (
          <IonItem key={i}>
            <IonLabel>{formatCamelCaseToSentence(field)}</IonLabel>
            <IonToggle
              checked={
                (accessibilityPreferenceSample as { [key: string]: boolean })[
                  field
                ]
              }
              onIonChange={async (evt) => {
                const data: AccessibilityPreferenceDTO = {
                  room,
                  accessibilityPreferences: { [field]: evt.detail.checked },
                };
                await new Promise((resolve) => {
                  socket.emit(
                    BroadcastEvents.REQUEST_ACCESSIBLITY_PREFERENCE,
                    data,
                    resolve
                  );
                });
                setAccessibilityPreferences({
                  ...accessibilityPreferenceSample,
                  [field]: evt.detail.checked,
                });
              }}
            ></IonToggle>
          </IonItem>
        ))}
      </IonList>

      <h4>Room Contexts</h4>
      <small>Sets Room Priorites. You can set the accessibility priority of the event, to determine how much importance is given to accessibility features in this event</small>
      <IonList>
        <IonItem>
          <IonLabel>Accessibilty Priority</IonLabel>
          <IonSelect
            value={roomContext?.accessibilityPriority}
            placeholder="Select how important accessibilty features should matter in this program"
            onIonChange={async (e) => {
              try {
                await new Promise((resolve) => {
                  const data: IRoomContext = {
                    accessibilityPriority: e.detail.value,
                    room,
                  } as unknown as IRoomContext; // to avoid specifying sharerSocketId
                  socket.emit(
                    BroadcastEvents.ROOM_CONTEXT_MODIFICATION,
                    data,
                    resolve
                  );
                });
                setRoomContext({
                  ...roomContext,
                  accessibilityPriority: e.detail.value,
                } as IRoomContext);
              } catch (error) {
                console.log("Error seting priority", (error as Error).message);
              }
            }}
          >
            {Object.values(AccessibilityPriority).map((field, i) => (
              <IonSelectOption value={field}>{field}</IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
      </IonList>

      <h3>Request Aid Service</h3>
      <small>
        Request for special aid services within your meeting like Sign Language
        Interpreter
      </small>
      <IonList>
        <IonItem>
          <IonSelect
            label="Please select service"
            labelPlacement="floating"
            onIonChange={(evt) => {
              const aidService = aidServices.find(
                (aService) => aService.id === Number(evt.detail.value)
              );
              postData(`${APIBaseURL}/aid-service/request-aid-service`, {
                method: "post",
                id: aidService?.id,
                name: aidService?.name,
                roomId: room,
              }).catch((err) => {
                presentToast(`Error requesting service`);
                console.log("Error requesting service", (err as Error).message);
              });
            }}
          >
            {aidServices.map((aidService) => (
              <IonSelectOption key={aidService.id} value={aidService.id}>
                {aidService.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
      </IonList>
     
    </div>
  );
};
