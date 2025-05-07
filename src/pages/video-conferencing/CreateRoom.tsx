import { FormEvent, FormEventHandler, useState } from "react";
import { IRoom } from "../../shared/interfaces/room";
import { AuthGuardContextProvider } from "../../contexts/auth/AuthGuardContext";
import { AuthLayout } from "../../layouts/AuthLayout";
import {
  DatetimeChangeEventDetail,
  DatetimeCustomEvent,
  IonButton,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  SelectCustomEvent,
} from "@ionic/react";
import { APIBaseURL, postData } from "../../api/base";
import { useHistory } from "react-router";

export interface ICreateRoomProps {
  roomType?: "instant" | "scheduled";
  onSuccess: Function
}

export const CreateRoom = ({ roomType, onSuccess }: ICreateRoomProps) => {
  const [room, setRoom] = useState({} as IRoom);
  const [openEventDateOverlay, setOpenEventDateOverlay] = useState(false);
  const router = useHistory();

  const handleCustomInput = (
    evt:
      | DatetimeCustomEvent
      | SelectCustomEvent
      | FormEvent<HTMLIonInputElement>
  ) => {
    const { name, value } = (evt as FormEvent<HTMLIonInputElement>)
      .currentTarget;
    setRoom({ ...room, [name]: value });
    setOpenEventDateOverlay(false);
  };

  const createEvent = async () => {
    try {

      const res = await postData(`${APIBaseURL}/room`, {
        method: "post",
        ...room,
      });
      onSuccess();
    window.location.href = (`/conference/rooms`);
    } catch (error) {
      console.log("Error creating event room", (error as Error).message);
    }
  };
  return (
    <>
      <IonHeader>
        <IonTitle> Create Meeting </IonTitle>
      </IonHeader>
      <IonContent>
        <div className="form-grop">
          <form>
            <IonItem className="no-lines">
              <IonInput
                type="text"
                name="roomName"
                label="name"
                labelPlacement="floating"
                placeholder="My Meeting"
                onInput={handleCustomInput}
              />
            </IonItem>

            <IonItem className="no-lines">
              <IonLabel>Start Time</IonLabel>
              <IonDatetimeButton datetime="event-start-time"></IonDatetimeButton>
            </IonItem>

            <IonModal isOpen={openEventDateOverlay} onDidDismiss={() => setOpenEventDateOverlay(false)} keepContentsMounted={true}>
              <IonDatetime
                id="event-start-time"
                name="startTime"
                aria-label="Select start date for the event"
                onIonChange={handleCustomInput}
              ></IonDatetime>
            </IonModal>

            <IonItem className="no-lines">
              <IonSelect
                name="duration"
                onIonChange={handleCustomInput}
                label="Event Duration"
                labelPlacement="stacked"
              >
                <IonSelectOption value={0}>Select Duration</IonSelectOption>
                {[5, 10, 15, 20, 30].map((durationTime, i) => (
                  <IonSelectOption key={i} value={durationTime}>
                    {durationTime} minutes{" "}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem className="no-lines">
              <IonButton expand="full" onClick={createEvent}>
                Create Event
              </IonButton>
            </IonItem>
          </form>
        </div>
      </IonContent>
    </>
  );
};
