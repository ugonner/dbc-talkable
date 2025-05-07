import { useEffect, useRef, useState } from "react";
import {
  TalkablePage,
  useTalkableContextStore,
} from "../../contexts/talkables/talkable";
import {
  IonAlert,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonPopover,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import {
  IChat,
  IChatMessage,
  IChatUser,
} from "../../shared/interfaces/talkables/chat";
import { TalkableChatEvents } from "../../shared/enums/talkables/chat-event.enum";
import { useHistory, useLocation } from "react-router";
import { IApiResponse } from "../../shared/dtos/responses/api-response";
import { ChatRoom } from "./ChatRoom";
import { home, homeOutline, menu } from "ionicons/icons";
import { ChatItem } from "./ChatItem";
import { LocalStorageKeys } from "../../shared/enums/talkables/talkables.enum";
import { TalkableUser } from "./TalkableUser";
import { CommunicationModeSelector } from "./CommunicationMode";

export const DBCChatUser: IChatUser = {
  userName: "DBC_OFFICIAL",
  userId: "dbc_official",
  phoneNumber: "08012345678"
};

export const Chats = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isAdmin = queryParams.get("adminId") === DBCChatUser.userId;
  const history = useHistory();

  const router = useHistory();
  const {
    chats,
    setChats,
    socketRef,
    newChat,
    chatMessages,
    statusOverlayOptions,
    setStatusOverlayOptions,
    attachSocketEvents,
    currentChatRef,
    talkablePage,
    navigateTalkableChatPages,
    userRef,
    communicationModeRef,
  } = useTalkableContextStore();
  const [displayAlert, dismissAlert] = useIonAlert();
  const [openTalkableMenuOverlay, setOpenTalkableMenuOverlay] = useState(false);

  const [openUserDataOverlay, setOpenUserDataOverlay] = useState(false);
  const [openCommunicationModeOverlay, setOpenCommunicationModeOverlay] =
    useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const localUserData = localStorage.getItem(LocalStorageKeys.CHAT_USER);
        setOpenUserDataOverlay(true);
      } catch (error) {
        console.log(
          "Error checking user data in chat home",
          (error as Error).message
        );
      }
    };
    init();
  }, []);

  const clearUserStoredData = (options: { dataType: "chat" | "all" }) => {
    try {
      localStorage.removeItem(LocalStorageKeys.CHAT_MESSAGES);
      localStorage.removeItem(LocalStorageKeys.CHATS);
      if (options.dataType === "all")
        localStorage.removeItem(LocalStorageKeys.CHAT_USER);
      history.push("/talkable");
    } catch (error) {
      console.log("Error clearing storage data", (error as Error).message);
    }
  };

  const setUpChat = async () => {
    try {
      await attachSocketEvents();
      if (!isAdmin) {
        await new Promise((resolve, reject) => {
          const userData: IChatUser =
            userRef.current ||
            ({
              userName: "Anonymous",
              userId: `Anonymous${Date.now()}`,
              phoneNumber: `${new Date().toISOString().split("T")[0].replace("-", "")}`
            } as IChatUser);

          //const data = {...(userRef.current || userData )}
          const data = userData;
          socketRef.current?.emit(TalkableChatEvents.JOIN_ROOM, data, resolve);
        });
        setStatusOverlayOptions({
          openOverlay: true,
          overlayEvent: TalkableChatEvents.JOIN_ROOM,
        });
      }
      if (isAdmin) {
        await new Promise((resolve, reject) => {
          const data = { ...DBCChatUser, isAdmin: true };
          socketRef.current?.emit(
            TalkableChatEvents.JOIN_AS_ADMIN,
            data,
            resolve
          );
        });
      }
    } catch (error) {
      console.log("Eror initializing chats", (error as Error).message);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonItem>
            <IonTitle>
              Talkable | {talkablePage.replace("_", " ").toLowerCase()}{" "}
            </IonTitle>
            <IonButton
              slot="start"
              fill="clear"
              aria-label="toggle home and chat room pages"
              onClick={() => {
                if (talkablePage !== TalkablePage.CHATS) navigateTalkableChatPages({to: TalkablePage.CHATS});
                else navigateTalkableChatPages({to: TalkablePage.CHAT_ROOM, chatRoomId: currentChatRef.current});
              }}
            >
              <IonIcon
                icon={
                  talkablePage === TalkablePage.CHAT_ROOM ? homeOutline : home
                }
              ></IonIcon>
            </IonButton>
            <IonButton
            id="talkable-menu-toggler"
              slot="end"
              fill="clear"
              onClick={() =>
                setOpenTalkableMenuOverlay(!openTalkableMenuOverlay)
              }
              aria-label="menu"
            >
              <IonIcon icon={menu}></IonIcon>
            </IonButton>
          </IonItem>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {talkablePage === TalkablePage.CHATS &&
          chats.length > 0 &&
          chats.map((chat, i) => <ChatItem key={i} chat={chat} />)}
        {talkablePage === TalkablePage.CHATS && chats.length === 0 && (
          <IonItem>
            <IonLabel>
              <h3>No Active Chats Yet</h3>
            </IonLabel>
          </IonItem>
        )}
        {talkablePage === TalkablePage.CHAT_ROOM && (
          <ChatRoom
            chatId={currentChatRef.current}
          />
        )}

        <IonAlert
          isOpen={
            statusOverlayOptions?.overlayEvent ===
              TalkableChatEvents.JOIN_ROOM_INVITE &&
            statusOverlayOptions?.openOverlay === true
          }
          onDidDismiss={() =>
            setStatusOverlayOptions({
              openOverlay: false,
              overlayEvent: "" as TalkableChatEvents,
            })
          }
          header={`${newChat?.users[0].userName} Requests Attention`}
          buttons={[
            {
              role: "destructive",
              text: "Accept",
              handler: async () => {
                try {
                  socketRef.current?.emit(
                    TalkableChatEvents.JOIN_INVITE_ACCEPTANCE,
                    newChat,
                  );


                } catch (error) {
                  console.log(
                    "Error acception invite",
                    (error as Error).message
                  );
                }
              },
            },

            {
              role: "destructive",
              text: "Reject",
              handler: async () => {
                try {
                  await new Promise((resolve, reject) => {
                    socketRef.current?.emit(
                      TalkableChatEvents.JOIN_INVITE_REJECTION,
                      DBCChatUser,
                      resolve
                    );
                  });
                } catch (error) {
                  console.log(
                    "Error rejecting invite",
                    (error as Error).message
                  );
                }
              },
            },
          ]}
        ></IonAlert>

        <IonPopover
          isOpen={
            statusOverlayOptions?.openOverlay === true &&
            statusOverlayOptions.overlayEvent === TalkableChatEvents.JOIN_ROOM
          }
          onDidDismiss={() =>
            setStatusOverlayOptions({
              openOverlay: false,
              overlayEvent: "" as TalkableChatEvents,
            })
          }
        >
          <IonItem>
            <IonLabel>
              <h3>Waiting Room</h3>
              <p>
                Please hold on while an official attends to you, in a minute
              </p>
            </IonLabel>
          </IonItem>
        </IonPopover>
        <IonModal
          isOpen={openUserDataOverlay}
          onDidDismiss={() => setOpenUserDataOverlay(false)}
        >
          <TalkableUser
            closeView={() => {
              setOpenUserDataOverlay(false);
              setUpChat();
            }}
          />
        </IonModal>
        <IonModal
          isOpen={openCommunicationModeOverlay}
          onDidDismiss={() => setOpenCommunicationModeOverlay(false)}
        >
          <CommunicationModeSelector
            closeView={() => {
              console.log("fired close view");
              setOpenCommunicationModeOverlay(false);
              //setUpChat();
            }}
          />
        </IonModal>

        <IonPopover
          isOpen={openTalkableMenuOverlay}
          onDidDismiss={() => setOpenTalkableMenuOverlay(false)}
          trigger="talkable-menu-toggler"
        >
          <div>
            <h4>Communication Mode Preferences</h4>
            <small>
              Select your preferred mode of communication:
              voice if you have difficulty in typing eg Palsy, Parkinson, amputees and select textual mode if you can use text typing.
            </small>
            <IonList>
              <IonItem>
                <IonText
                  role="BUTTON"
                  onClick={() => setOpenCommunicationModeOverlay(true)}
                >
                  Set Communication Mode
                </IonText>
              </IonItem>
            </IonList>
            <h4>App Data</h4>
            <small>
              Clear information you stored on this app, this does not block any
              use
            </small>
            <IonList>
              <IonItem>
                <IonButton
                  fill="clear"
                  onClick={() => {
                    displayAlert({
                      header: "App Data",
                      subHeader:
                        "Clear data used on this app, to free up storage or refresh chats",
                      onDidDismiss: () => setOpenTalkableMenuOverlay(false),
                      buttons: [
                        {
                          role: "destructive",
                          text: "Clear Chats",
                          handler: () =>
                            clearUserStoredData({ dataType: "chat" }),
                        },
                        {
                          role: "destructive",
                          text: "Clear All",
                          handler: () =>
                            clearUserStoredData({ dataType: "all" }),
                        },
                        {
                          role: "cancel",
                          text: "Cancel",
                        },
                      ],
                    });
                  }}
                >
                  Clear Data
                </IonButton>
              </IonItem>
            </IonList>
          </div>
        </IonPopover>
      </IonContent>
    </IonPage>
  );
};
