import { InputInputEventDetail, IonInputCustomEvent } from "@ionic/core";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  useIonToast,
} from "@ionic/react";
import { Dispatch, FormEvent, useState } from "react";
import { APIBaseURL, postData } from "../../api/base";
import { IAuthUserProfile, ILoginResponse } from "../../shared/interfaces/user";
import { useAuthGuardContextStore } from "../../contexts/auth/AuthGuardContext";
import { useAsyncHelpersContext } from "../../contexts/async-helpers";

export interface IAuthUser {
  email?: string;
  password: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
}

export interface ILoginOrCreateUserProps {
  onSuccess: Function;
}

export const LoginOrRegister = ({onSuccess}: ILoginOrCreateUserProps) => {
  const {setLoading} = useAsyncHelpersContext();

  const [isSignUp, setIsSignUp] = useState(false);
  const [authUser, setAuthUser] = useState({} as IAuthUser);
  const [showPassword, setShowPassword] = useState(false);
  const [usePhoneNumber, setUsePhoneNumber] = useState(false);

  const [presentToast] = useIonToast();
  const { setIsLoggedIn } = useAuthGuardContextStore();

  const { setOpenAuthModal } = useAuthGuardContextStore();

  const handleInput = (e: FormEvent<HTMLIonInputElement>) => {
    const { name, value } = e.currentTarget;
    setAuthUser({ ...authUser, [name]: value });
  };

  const submit = async () => {
    try {
      setLoading({isLoading: true, loadingMessage: ""})
      const res = isSignUp
        ? await postData(`${APIBaseURL}/auth/register`, {
            method: "post",
            ...authUser,
          })
        : await postData(`${APIBaseURL}/auth/login`, {
            method: "post",
            ...authUser,
          });
      localStorage.setItem("user", JSON.stringify(res as IAuthUserProfile));
      if ((res as ILoginResponse).token) {
        localStorage.setItem("token", `${(res as ILoginResponse).token}`);
        setIsLoggedIn(true as boolean & Dispatch<boolean>);
      }
      presentToast("Successful Access", 3000);
      setLoading({isLoading: false, loadingMessage: ""})
      setOpenAuthModal(false as unknown as boolean & Dispatch<boolean>);
      onSuccess();
      window.location.reload();
     
      
    } catch (error) {
      setLoading({isLoading: false, loadingMessage: ""})
      presentToast((error as Error).message, 3000);
      console.log((error as Error).message, "Error signin or registring user");
    }
  };

  return (
    <>
      <IonHeader>
        <IonTitle>Welcome Dear</IonTitle>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="">
          <IonSegment>
            <IonSegmentButton
              value={0}
              aria-label="Use email for login or sign up"
              onClick={() => setUsePhoneNumber(false)}
            >
              Use Email
            </IonSegmentButton>
            <IonSegmentButton value={1} 
              aria-label="Use phone number for login or sign up" onClick={() => setUsePhoneNumber(true)}>
              Use PhoneNumber
            </IonSegmentButton>
          </IonSegment>
          <form>
            <div className="">
              {usePhoneNumber ? (
                <IonItem>
                  <IonInput
                    type="tel"
                    name="phoneNumber"
                    label="Phone Number"
                    value={authUser.phoneNumber}
                    labelPlacement="floating"
                    onInput={handleInput}
                    required={true}
                  ></IonInput>
                </IonItem>
              ) : (
                <IonItem>
                  <IonInput
                    type="email"
                    name="email"
                    label="Email"
                    labelPlacement="floating"
                    onInput={handleInput}
                    required={true}
                  ></IonInput>
                </IonItem>
              )}
            </div>

            <div className="">
              <IonItem>
                <IonInput
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={authUser.password}
                  label="password"
                  labelPlacement="floating"
                  onInput={handleInput}
                ></IonInput>
              </IonItem>
              <IonButton
              fill="clear"
                size="small"
                onClick={() => setShowPassword(!showPassword)}
              >
                show / hide password
              </IonButton>
            </div>

            {isSignUp ? (
              <div>
                <div className="">
                  <IonItem>
                    <IonInput
                      type="text"
                      name="firstName"
                      value={authUser.firstName}
                      fill="solid"
                      label="firstName"
                      labelPlacement="floating"
                      onInput={handleInput}
                    ></IonInput>
                  </IonItem>
                </div>

                <div className="">
                  <IonItem>
                    <IonInput
                      type="text"
                      name="lastName"
                      value={authUser.lastName}
                      fill="solid"
                      label="lastName"
                      labelPlacement="floating"
                      onInput={handleInput}
                    ></IonInput>
                  </IonItem>
                </div>
              </div>
            ) : (
              <></>
            )}
            <div className="form-group">
              <IonButton expand="full" onClick={submit}>
                {isSignUp ? "Register" : "Login"}
              </IonButton>
              <div>
                <IonButton expand="full" fill="clear" onClick={() => setIsSignUp(true)}>
                  New Account, Sign up{" "}
                </IonButton>
                <IonButton expand="full" fill="clear" onClick={() => setIsSignUp(false)}>
                  Existing User, Log In{" "}
                </IonButton>
              </div>
            </div>
          </form>
        </div>
      </IonContent>
    </>
  );
};
