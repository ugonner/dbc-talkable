import { useEffect, useState } from "react";
import {
  IonButton,
  IonCol,
  IonGrid,
  IonToolbar,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPopover,
  IonRow,
  IonSearchbar,
  IonText,
  useIonAlert,
  useIonToast,
} from "@ionic/react";
import {
  ILoadingProps,
  useAsyncHelpersContext,
} from "../../contexts/async-helpers";
import { APIBaseURL, getData, postData } from "../../api/base";
import { IQueryResult } from "../../shared/interfaces/api-response";
import { IApiResponse } from "../../shared/dtos/responses/api-response";
import { IAidService } from "../../shared/interfaces/aid-service.interface";
import { closeCircle, ellipsisVertical, handLeft } from "ionicons/icons";
import { IAuthUserProfile } from "../../shared/interfaces/user";
import { EditUserProfile } from "./EditUserProfile";

const UserItem = ({
  selectedUser,
  aidServices,
}: {
  selectedUser: IAuthUserProfile;
  aidServices: IAidService[];
}) => {
  const [presentToast] = useIonToast();
  const { setLoading } = useAsyncHelpersContext();
  const [page, setPage] = useState(0);
  const limit = 10;
  const [displayAlert, dismissAlert] = useIonAlert();

  const [openUserMenuOverlay, setOpenUserMenuOverlay] = useState(false);
  const [openUserServices, setOpenUserServices] = useState(false);
  const [openEditUserOverlay, setOpenEditUserOverlay] = useState(false);

  return (
    <>
      <IonItem>
        <IonLabel>
          <h4>{selectedUser.firstName}</h4>
          <small>
            Offers {selectedUser?.aidServices.length || 0} Aid Services
          </small>
        </IonLabel>
        <IonButton
        fill="clear"
          id={`${selectedUser?.id}`}
          slot="end"
          role="button"
          onClick={() => {
            setOpenUserMenuOverlay(!openUserMenuOverlay);
          }}
        >
          <IonIcon name={ellipsisVertical}></IonIcon>
        </IonButton>
      </IonItem>

      <IonPopover
        isOpen={openUserMenuOverlay}
        onDidDismiss={() => setOpenUserMenuOverlay(false)}
        trigger={`${selectedUser?.id}`}
      >
        <IonList>
          <IonItem>
            <IonText
              role="button"
              onClick={() => {
                setOpenUserMenuOverlay(false);
                displayAlert({
                  header: "Aid Services",
                  buttons: aidServices.map((aidService) => {
                    const hasService = selectedUser?.aidServices?.find(
                      (userAidService) => userAidService.id === aidService.id
                    );
                    const action = hasService ? "Remove" : "Add";
                    return {
                      role: "destructive",
                      text: `${action} ${aidService.name}`,
                      handler: async () => {
                        try {
                          const res = await postData(
                            `${APIBaseURL}/aid-service/update-aid-service/${
                              selectedUser?.userId
                            }/${action.toLowerCase()}`,
                            {
                              method: "post",
                              aidServiceId: aidService.id,
                            }
                          );
                        } catch (error) {
                          console.log(
                            "Error managing user aid service",
                            (error as Error).message
                          );
                          presentToast("Error managing user aid service", 3000);
                        }
                      },
                    };
                  }),
                });
              }}
            >
              Assign Aid Service
            </IonText>
          </IonItem>

          <IonItem>
            <IonText role="button" onClick={() => setOpenEditUserOverlay(true)}>
              Edit Profile
            </IonText>
          </IonItem>

          <IonItem>
            <IonText
              id={`user-service-${selectedUser.userId}`}
              role="button"
              onClick={() => setOpenUserMenuOverlay(!openUserServices)}
            >
              View Services
            </IonText>
          </IonItem>

          <IonPopover
            isOpen={openUserServices}
            onDidDismiss={() => setOpenUserMenuOverlay(false)}
            trigger={`user-service-${selectedUser.userId}`}
          >
            <IonList>
              {selectedUser.aidServices.length > 0 &&
                selectedUser.aidServices.map((userService, i) => (
                  <IonItem key={i}>
                    <IonText>{userService.name}</IonText>
                  </IonItem>
                ))}
              {selectedUser.aidServices.length === 0 && (
                <IonItem>
                  <IonText>No Services </IonText>
                </IonItem>
              )}
            </IonList>
          </IonPopover>
        </IonList>
      </IonPopover>

      <IonModal
        isOpen={openEditUserOverlay}
        onDidDismiss={() => setOpenEditUserOverlay(false)}
      >
        <IonItem>
          <IonButton
            slot="end"
            role="button"
            onClick={() => setOpenEditUserOverlay(false)}
          >
            <IonIcon name={closeCircle}></IonIcon> close
          </IonButton>
        </IonItem>

        <EditUserProfile user={selectedUser} />
      </IonModal>
    </>
  );
};
export const UserMgt = () => {
  const [users, setUsers] = useState<IAuthUserProfile[]>([]);
  const [aidServices, setAidServices] = useState<IAidService[]>([]);

  useEffect(() => {
    const initData = async () => {
      try {
        const res = await getData<IQueryResult<IAuthUserProfile>>(
          `${APIBaseURL}/auth/`
        );
        setUsers(res.data);
        const aidServiceRes = await getData<IQueryResult<IAidService>>(
          `${APIBaseURL}/aid-service`
        );
        setAidServices(aidServiceRes.data);
      } catch (error) {
        console.log("Error getting users", (error as Error).message);
      }
    };
    initData();
  }, []);
  return (
    <div>
      <IonToolbar>
        <IonItem>
        <IonText>Users</IonText>
          
        <IonSearchbar
          debounce={300}
          onIonInput={async (evt) => {
            try {
              const searchTerm = evt.detail.value;
              console.log("searc", searchTerm);
              const res = await getData<IQueryResult<IAuthUserProfile>>(
                `${APIBaseURL}/auth`,
                { searchTerm }
              );
              console.log("users", res.data);
              setUsers(res.data);
            } catch (error) {
              console.log("Error searching users", (error as Error).message);
            }
          }}
        ></IonSearchbar>
        </IonItem>
      </IonToolbar>
      {users && users.length > 0 ? (
        <IonList>
          {users.map((user) => (
            <UserItem
              key={user.id}
              selectedUser={user}
              aidServices={aidServices}
            />
          ))}
        </IonList>
      ) : (
        <h3>No users found</h3>
      )}
    </div>
  );
};
