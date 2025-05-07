import { useState } from "react";
import {
  ICommunicationMode,
  useTalkableContextStore,
} from "../../contexts/talkables/talkable";
import { IChatUser } from "../../shared/interfaces/talkables/chat";
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonText,
  IonToolbar,
} from "@ionic/react";
import { warningSharp } from "ionicons/icons";
import {
  CommunicationModeEnum,
  LocalStorageKeys,
} from "../../shared/enums/talkables/talkables.enum";
import { formatCamelCaseToSentence } from "../../shared/helpers";
import { TTSOptions } from "@capacitor-community/text-to-speech";

export const generateUserId = (userName?: string): string =>
  `${userName}${new Date().toISOString().split("T")[0].replace("-", "")}`;

export interface ITalkableUserProps {
  closeView?: Function;
}

export const TalkableUser = ({ closeView }: ITalkableUserProps) => {
  const chatUserInitData = localStorage.getItem(LocalStorageKeys.CHAT_USER);
  const chatUserInit: IChatUser = JSON.parse(
    chatUserInitData || JSON.stringify({})
  );

  const { userRef, ttsOptionsRef } = useTalkableContextStore();

  const [chatUser, setChatUser] = useState<IChatUser>(
    chatUserInit || ({} as IChatUser)
  );
  const [step, setStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const saveChatUserData = (userData: IChatUser) => {
    if (!userData.userName.trim()) {
      setErrorMessage("User name is required");
      setStep(1);
      return;
    }
    setErrorMessage("");
    const ttsOptions: TTSOptions = {
      text: "",
      voice: userData?.gender === "M" ? 0 : 1,
    };
    ttsOptionsRef.current = ttsOptions;
    userData.userId = generateUserId(userData.userName);
    userRef.current = userData;
    localStorage.setItem(
      LocalStorageKeys.CHAT_USER,
      JSON.stringify(userData || {})
    );
    if (closeView) closeView();
  };

  return (
    <div>
      <IonItem>
        <IonLabel>
          <IonIcon icon={warningSharp}></IonIcon>
          <IonText>{errorMessage}</IonText>
        </IonLabel>
      </IonItem>
      {step === 0 && (
        <div>
          <IonItem>
            <IonLabel>
              <h4>User Profile</h4>
              {Object.keys(chatUser || {}).map((field, i) => (
                <p key={i}>
                  <small>
                    {formatCamelCaseToSentence(field)}:{" "}
                    {(chatUser as unknown as { [key: string]: string })[field]}{" "}
                  </small>
                </p>
              ))}
              <IonButton fill="clear" onClick={() => setStep(1)}>
                {chatUser?.userName ? "Edit" : "Add Your Visit Profile"}
              </IonButton>
              {chatUser?.userName && (
                <IonButton
                  fill="clear"
                  onClick={() => {
                    saveChatUserData(chatUser);
                  }}
                >
                  Use Profile
                </IonButton>
              )}
            </IonLabel>
          </IonItem>
        </div>
      )}
      {step === 1 && (
        <div>
          <IonItem>
            <IonInput
              label="username"
              labelPlacement="stacked"
              name="userName"
              value={chatUser?.userName}
              onIonChange={(evt) => {
                const { name, value } = evt.target;
                setChatUser({ ...chatUser, [name]: value } as IChatUser);
              }}
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonInput
              label="phone number"
              labelPlacement="stacked"
              name="phoneNumber"
              value={chatUser?.phoneNumber}
              onIonChange={(evt) => {
                const { name, value } = evt.target;
                setChatUser({ ...chatUser, [name]: value } as IChatUser);
              }}
            ></IonInput>
          </IonItem>
          {chatUser?.phoneNumber?.length < 11 && (
            <IonLabel position="stacked">Enter valid phone number</IonLabel>
          )}
          <IonItem>
            <IonSelect
              label="gender"
              labelPlacement="stacked"
              onIonChange={(evt) => {
                const { name, value } = evt.target;
                setChatUser({ ...chatUser, [name]: value });
              }}
            >
              <IonSelectOption value={"M"}>Male</IonSelectOption>
              <IonSelectOption value={"F"}>Female</IonSelectOption>
            </IonSelect>
          </IonItem>
        </div>
      )}
      {step === 2 && (
        <IonItem>
          <IonInput
            label="organization (Enter your organization name or type in 'Personal' if you are on a personal visit )"
            labelPlacement="stacked"
            name="organization"
            value={chatUser?.organization}
            onIonChange={(evt) => {
              const { name, value } = evt.target;
              setChatUser({ ...chatUser, [name]: value } as IChatUser);
            }}
          ></IonInput>
        </IonItem>
      )}
      {step === 3 && (
        <IonItem>
          <IonInput
            label="Purpose of visit"
            labelPlacement="stacked"
            name="purpose"
            value={chatUser?.purpose}
            onIonChange={(evt) => {
              const { name, value } = evt.target;
              setChatUser({ ...chatUser, [name]: value } as IChatUser);
            }}
          ></IonInput>
        </IonItem>
      )}
      {step === 4 && (
        <div>
          <h4>Choose Communication Preferences</h4>
          <small>
            Select your prefered mode of communication to suit your situation,
            Select your prefered mode of communication: Use voice if you have
            difficulty typing texts eg: Palsy, Parkinson patients and amputees.
            Use text if you are more comfortable with texts and typing
          </small>
          <IonItem>
            <IonSelect
              label="Select Disability Preference"
              labelPlacement="stacked"
              name={"communicationMode"}
              onIonChange={(evt) => {
                const { name, value } = evt.target;
                setChatUser({ ...chatUser, [name]: value } as IChatUser);
              }}
            >
              <IonSelectOption value={CommunicationModeEnum.TEXT}>
                i Prefer To Use Text
              </IonSelectOption>
              <IonSelectOption value={CommunicationModeEnum.VOICE}>
                I Prefer To Use Voice{" "}
              </IonSelectOption>
            </IonSelect>
          </IonItem>
        </div>
      )}
      {step > 0 && (
        <IonToolbar>
          <IonItem>
            <IonButton
              fill="clear"
              onClick={() => {
                try {
                  if (step < 4) return setStep(step + 1);
                  if (!chatUser?.userName) {
                    setErrorMessage("Please set user name");
                    setStep(1);
                    return;
                  }
                  if (chatUser?.phoneNumber?.length < 11) {
                    setErrorMessage("Phone number is invalid");
                    setStep(1);
                    return;
                  }
                  if (!chatUser?.communicationMode) {
                    setErrorMessage("Please select communication mode");
                    setStep(4);
                    return;
                  }
                  saveChatUserData(chatUser);
                } catch (error) {
                  console.log(
                    "Error handling input of setting user data",
                    (error as Error).message
                  );
                }
              }}
            >
              {step < 4 ? "Continue" : "Proceed"}
            </IonButton>
          </IonItem>
          <IonItem>
            {[0, 1, 2, 3, 4].map((stepNumber) => (
              <IonButton
                className="ion-padding"
                fill={step === stepNumber ? "solid" : "clear"}
                onClick={() => setStep(stepNumber)}
              >
                {stepNumber === 0 ? "Profile" : stepNumber}
              </IonButton>
            ))}
          </IonItem>
        </IonToolbar>
      )}
    </div>
  );
};
