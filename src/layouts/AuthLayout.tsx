import {
  IonButton,
  IonContent,
  IonDatetimeButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  AuthGuardContextProvider,
  useAuthGuardContextStore,
} from "../contexts/auth/AuthGuardContext";
import { Dispatch, PropsWithChildren, useState } from "react";
import { LoginOrRegister } from "../components/auth/LoginOrRegister";
import { flash } from "ionicons/icons";

export interface IAuthLayoutProps extends PropsWithChildren {
  pageTitle?: string;
}
export const AuthLayout = ({ pageTitle, children }: IAuthLayoutProps) => {
  const { isLoggedIn, setIsLoggedIn, openAuthModal, setOpenAuthModal } =
    useAuthGuardContextStore();
  const [openEventModal, setOpenEventModal] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false as boolean & Dispatch<boolean>);
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle slot="start">{pageTitle ? pageTitle : ""}</IonTitle>

          <IonButton
            slot="end"
            onClick={() => {
              if (isLoggedIn) logout();
              //else setShowModalText("login-or-register-modal");
              setOpenAuthModal(!openAuthModal as boolean & Dispatch<boolean>);
            }}
          >
            {isLoggedIn ? "logout" : "login"}
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {children}
      </IonContent>


      <IonModal isOpen={openAuthModal}>
        <LoginOrRegister onSuccess={() => setOpenAuthModal(false as boolean & Dispatch<boolean>)} />
      </IonModal>
    </IonPage>
  );
};
