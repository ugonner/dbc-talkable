import { IonItem, IonSelect, IonSelectOption } from "@ionic/react";
import { useState } from "react";
import { ICommunicationMode, useTalkableContextStore } from "../../contexts/talkables/talkable";
import { CommunicationModeEnum, LocalStorageKeys } from "../../shared/enums/talkables/talkables.enum";
import { IChatUser } from "../../shared/interfaces/talkables/chat";

export interface ICommuncationModeSelectorProps {
    closeView: Function;
}
export const CommunicationModeSelector = ({closeView}: ICommuncationModeSelectorProps) => {
  const localUserData = localStorage.getItem(LocalStorageKeys.CHAT_USER);
  const localUser: IChatUser = JSON.parse(localUserData || JSON.stringify({}));
  
  const [userData, setUserData] = useState<IChatUser>(localUser)
  const [communicationMode, setCommunicationMode] = useState<ICommunicationMode>();
    const {userRef} = useTalkableContextStore();

    return (
         <div>
                    <h4>Choose Communication Preferences</h4>
                    <small>Select your prefered mode of communication: Use voice if you have difficulty typing texts eg: Palsy, Parkinson patients and amputees. Use text if you are more comfortable with texts and typing</small>
                    <IonItem>
                  <IonSelect
                    label="Select Disability Preference"
                    labelPlacement="stacked"
                    onIonChange={(evt) => {
                      const { value } = evt.target;
                      const data: IChatUser = {...userData, communicationMode: value};
                      userRef.current = data;
                      setUserData(data);
                      localStorage.setItem(LocalStorageKeys.CHAT_USER, JSON.stringify(userRef.current))
                      if(closeView) closeView();
                    }}
                  >
                    <IonSelectOption value={CommunicationModeEnum.TEXT}>i Prefer To Use Text</IonSelectOption>
                    <IonSelectOption value={CommunicationModeEnum.VOICE}>I Prefer To Use Voice </IonSelectOption>
                  </IonSelect>
                </IonItem>
                </div>
    )
}