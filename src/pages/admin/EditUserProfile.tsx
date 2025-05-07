import { useState } from "react";
import { IAuthUserProfile } from "../../shared/interfaces/user";
import {
  IonButton,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { APIBaseURL, postData } from "../../api/base";

export const EditUserProfile = ({ user }: { user: IAuthUserProfile }) => {
  const [editData, setEditData] = useState<IAuthUserProfile>(user);

  return (
    <>
      <IonItem>
        <IonInput
          name="firstName"
          value={editData.firstName}
          onIonInput={(evt) => {
            const { name, value } = evt.target;
            setEditData({ ...editData, [name]: value });
          }}
          label={`firstName | ${user.firstName || ""}`}
          labelPlacement="stacked"
        />
      </IonItem>
      <IonItem>
        <IonInput
          name="lastName"
          value={editData.lastName}
          onIonInput={(evt) => {
            const { name, value } = evt.target;
            setEditData({ ...editData, [name]: value });
          }}
          label={`firstName | ${user.lastName || ""}`}
          labelPlacement="stacked"
        />
      </IonItem>

      <IonItem>
        <IonSelect
          name="gender"
          onIonChange={(evt) => {
            const { name, value } = evt.target;
            setEditData({ ...editData, [name]: value });
          }}
          label={`Gender | ${user.profile?.gender || ""}`}
          labelPlacement="stacked"
        >
          <IonSelectOption value={"F"}>Female</IonSelectOption>
          <IonSelectOption value={"M"}>Male</IonSelectOption>
        </IonSelect>
      </IonItem>
      <IonItem>
        <IonButton
          fill="clear"
          onClick={async () => {
            try {
              await postData(`${APIBaseURL}/user?userId=${user.userId}`, {
                method: "put",
                ...editData,
              });
            } catch (error) {
              console.log("Error editing user", (error as Error).message);
            }
          }}
        >
          Save
        </IonButton>
      </IonItem>
    </>
  );
};
