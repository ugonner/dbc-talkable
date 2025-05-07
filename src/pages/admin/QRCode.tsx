import { useEffect, useState } from "react";
import { useTalkableContextStore } from "../../contexts/talkables/talkable";
import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonModal,
  IonRow,
  IonText,
  useIonToast,
} from "@ionic/react";
import QRCode from "react-qr-code";
import { APIBaseURL, AppBaseUrl, appPort, serverPort } from "../../api/base";
import { checkmark, checkmarkCircle, closeCircle } from "ionicons/icons";
import { presentToast } from "../../shared/helpers";

export const QRCodePage = () => {
  
  const [openQRCodeOverlay, setOpenQRCodeOverlay] = useState(false);
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [presentToast] = useIonToast();

  return (
    <div>
      <IonGrid>
        <IonRow>
          <IonCol size="4" className="ion-padding">
            <IonItem>
              <IonInput
                name="wifiSSID"
                type="text"
                onIonChange={(evt) =>
                  setWifiSSID(evt.target.value as string)
                }
                label="WiFi Hostspot's UserName"
                labelPlacement="stacked"
              />
            </IonItem>
            <IonItem>
              <IonInput
                type={showPassword ? "text" : "password"}
                onIonChange={(evt) =>
                  setWifiPassword(evt.target.value as string)
                }
                label="WiFi Hostspot's Password"
                labelPlacement="stacked"
              />
            </IonItem>
            <IonText
              role="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <small>show / hide password</small>
            </IonText>
            <IonItem>
              <IonButton
                fill="clear"
                expand="full"
                onClick={() => {
                  alert(wifiSSID.length + " and " + wifiPassword.length)
                  if (wifiSSID.length < 3 || wifiPassword.length < 3)
                    return presentToast(
                      "Ensure wifi username and password are filled",
                      3000
                    );

                  setOpenQRCodeOverlay(!openQRCodeOverlay);
                }}
              >
                Generate QR Codes
              </IonButton>
            </IonItem>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonModal
        isOpen={openQRCodeOverlay}
        backdropDismiss={false}
        onDidDismiss={() => setOpenQRCodeOverlay(false)}
      >
        <IonItem>
          <IonButton
            slot="end"
            fill="clear"
            className="icon-only"
            onClick={() => setOpenQRCodeOverlay(false)}
          >
            <IonIcon icon={closeCircle}></IonIcon>
          </IonButton>
        </IonItem>

        <div>
          <h1 style={{ textAlign: "center" }}>
            <IonIcon icon={checkmarkCircle} />
            <br />
            QR Codes Generated successfully!
          </h1>

          <IonGrid>
            <IonRow>
              <IonCol>
                <h1>Connection QR</h1>
                <p>
                  Use a QR Scanner on your device to scan the QR Code to connect
                  to this Office
                </p>
                <div style={{ justifyContent: "center" }}>
                  <QRCode
                    value={`WIFI:T:WPA;S:${wifiSSID};P:${wifiPassword};;`}
                    size={200}
                  />
                </div>
              </IonCol>
              <IonCol>
                <h1>Office Desk Access QR</h1>
                <p>
                  After a successful connection as described above, then scan
                  the QR below to access the Office Desk Room
                </p>
                <div>
                  <QRCode value={`${AppBaseUrl}/talkable`} size={200} />
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
          <div></div>

          <div></div>
        </div>
      </IonModal>
    </div>
  );
};
