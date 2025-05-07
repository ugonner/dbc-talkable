import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonPage,
  IonPopover,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { AsyncHelperProvider } from "../../contexts/async-helpers";
import { AuthGuardContextProvider } from "../../contexts/auth/AuthGuardContext";
import { useState } from "react";
import PageManager from "@ionic/react/dist/types/routing/PageManager";
import { UserMgt } from "./UserMgt";
import { AidServiceMgt } from "./AidServiceMgt";
import { menu } from "ionicons/icons";
import { QRCodePage } from "./QRCode";

export const AdminBoard = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [openBoardMenuOverlay, setOpenBoardMenuOverlay] = useState(false);
  return (
    <AsyncHelperProvider>
      <AuthGuardContextProvider>
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonItem>
                <IonTitle>Dashboard</IonTitle>
                <IonButton
                  fill="clear"
                  onClick={() => setOpenBoardMenuOverlay(!openBoardMenuOverlay)}
                  id="board-menu-toggler"
                >
                  <IonIcon icon={menu}></IonIcon>
                </IonButton>
              </IonItem>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {pageNumber === 1 && <UserMgt />}
            {pageNumber === 2 && <AidServiceMgt />}
            {pageNumber === 3 && <QRCodePage />}

            <IonPopover
              isOpen={openBoardMenuOverlay}
              onDidDismiss={() => setOpenBoardMenuOverlay(false)}
              trigger="board-menu-toggler"
            >
              <div>
                <IonItem>
                  <IonText role="button" onClick={() => {setOpenBoardMenuOverlay(false); setPageNumber(1)}}>
                    Users
                  </IonText>
                </IonItem>
                <IonItem>
                  <IonText role="button" onClick={() => { setOpenBoardMenuOverlay(false); setPageNumber(2)}}>
                    Aid Services
                  </IonText>
                </IonItem>
                <IonItem>
                  <IonText role="button" onClick={() => { setOpenBoardMenuOverlay(false); setPageNumber(3)}}>
                    Generate QR codes
                  </IonText>
                </IonItem>
              </div>
            </IonPopover>
          </IonContent>
        </IonPage>
      </AuthGuardContextProvider>
    </AsyncHelperProvider>
  );
};
