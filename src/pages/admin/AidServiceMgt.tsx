import { useEffect, useState } from "react";
import { IAidService } from "../../shared/interfaces/aid-service.interface";
import { IonBackButton, IonButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPopover, IonText, IonTextarea } from "@ionic/react";
import { addCircle, close, ellipsisVertical, pencil } from "ionicons/icons";
import { APIBaseURL, getData, postData } from "../../api/base";
import { IQueryResult } from "../../shared/interfaces/api-response";

const AidServiceItem = ({aidService}: {aidService: IAidService}) => {
  const [openEditAidServiceOverlay, setOpenEditAidServiceOverlay] = useState(false);
  const [openActionOverlay,  setOpenActionOverlay] = useState(false);
  const [editData, setEditData] = useState<IAidService>(aidService);

  return (
    <>
        <IonItem>
            <IonLabel>
                <h4>{aidService.name}</h4>
                <small>{(aidService.users || []).length} Personnel Strength</small>
            </IonLabel>
            <IonButton
            fill="clear"
            id={`aid-service${aidService.id}`}
            slot="end"
            onClick={() => setOpenActionOverlay(!openActionOverlay)}
            aria-label="more"
            >
                <IonIcon name={ellipsisVertical}></IonIcon>
            </IonButton>
        </IonItem>

        <IonPopover
        isOpen={openActionOverlay}
        onDidDismiss={() => setOpenActionOverlay(false)}
        trigger={`aid-service${aidService.id}`}
        >
            <IonList>
                <IonItem>
                    <IonText
                    role="button"
                    onClick={() => setOpenEditAidServiceOverlay(!openEditAidServiceOverlay)}
                    >
                        Edit
                    </IonText>
                </IonItem>
            </IonList>
        </IonPopover>

        <IonPopover
        isOpen={openEditAidServiceOverlay}
        onDidDismiss={() => setOpenEditAidServiceOverlay(false)}
        >
            <div>
                <IonItem>
                    <IonText role="button" onClick={() => setOpenEditAidServiceOverlay(false)}>
                        <IonIcon name={close}></IonIcon>
                    </IonText>
                </IonItem>
                <IonItem>
                    <IonInput
                    type="text"
                    name="name"
                    value={editData?.name}
                    onIonChange={(evt) => {
                        const {value} = evt.detail;
                        setEditData({...(editData || {} as IAidService), name: value as string});
                    }}></IonInput>


                </IonItem>
                <IonItem>
                <IonTextarea
                    label="Description (optional)"
                    labelPlacement="stacked"
                    name="description"
                    value={editData?.description}
                    onIonInput={(evt) => {
                        const {name, value} = evt.target;
                        setEditData({...(editData || {}), [name]: value} as IAidService)
                    }}>
                    </IonTextarea>
                </IonItem>
                <IonItem>
                    <IonButton
                    fill="clear"
                    onClick={ async () => {
                        try{
                            const res = await postData(`${APIBaseURL}/aid-service/${aidService.id}`, {
                                method: "put",
                                ...editData
                            })
                            setOpenEditAidServiceOverlay(false);
                        }catch(error){
                            console.log("Error updating aid service", (error as Error).message)
                        }
                    }}>
                        Save
                    </IonButton>
                </IonItem>
            </div>
        </IonPopover>
    </>
  )
}

export const AidServiceMgt = () => {
    const [aidServices, setAidServices] = useState<IAidService[]>();
    const [openCreateAidServiceOverlay, setOpenCreateAidServiceOverlay] = useState(false);
    const [aidServiceData, setAidServiceData] = useState<IAidService>();

    useEffect(() => {
        const initData = async () => {
            try{
                const res = await getData<IQueryResult<IAidService>>(`${APIBaseURL}/aid-service`);
                console.log("res", res.data)
                setAidServices(res.data);
            }catch(error){
                console.log("Error fetching aid services", (error as Error).message)
            }
        }
        initData();
    }, []);

    return (
        <div>

                <IonItem>
                    <IonText>Aid Services</IonText>
                    <IonButton
                    fill="clear"
                    slot="end"
                    onClick={() => setOpenCreateAidServiceOverlay(true)}
                    >
                        <IonIcon name={addCircle}></IonIcon> New Aid Service
                    </IonButton>
                </IonItem>
                
            {
                aidServices && aidServices.length > 0 ? (
                    aidServices.map((aidService, i) => (
                        <AidServiceItem aidService={aidService} key={i} />
                    ))
                ) : (
                    <h3>No Aid Services found</h3>
                )
            }


            <IonPopover
            isOpen={openCreateAidServiceOverlay}
            onDidDismiss={() => setOpenCreateAidServiceOverlay(false)}
            >
                <div>
                    <IonItem>
                        <IonText>Create New Aid Service</IonText>
                        <IonText slot="end" role="destructive" onClick={() => setOpenCreateAidServiceOverlay(false)}>
                            <IonIcon name={close}></IonIcon>
                        </IonText>
                    </IonItem>
                    
                <IonItem>
                    <IonInput
                    type="text"
                    label="Aid Service Name"
                    labelPlacement="stacked"
                    name="name"
                    value={aidServiceData?.name}
                    onIonChange={(evt) => {
                        const {value} = evt.detail;
                        setAidServiceData({...(aidServiceData || {} as IAidService), name: value as string});
                    }}></IonInput>
                </IonItem>
                <IonItem>
                <IonTextarea
                    label="Description (optional)"
                    labelPlacement="stacked"
                    name="description"
                    value={aidServiceData?.description}
                    onIonInput={(evt) => {
                        const {name, value} = evt.target;
                        setAidServiceData({...(aidServiceData || {}), [name]: value} as IAidService)
                    }}>
                    </IonTextarea>
                </IonItem>
                <IonItem>
                    <IonButton
                    fill="clear"
                    onClick={ async () => {
                        try{
                            const res = await postData(`${APIBaseURL}/aid-service/`, {
                                method: "post",
                                ...aidServiceData
                            })
                            setOpenCreateAidServiceOverlay(false);
                        }catch(error){
                            console.log("Error updating aid service", (error as Error).message)
                        }
                    }}>
                        Save
                    </IonButton>
                </IonItem>
                </div>
            </IonPopover>
        </div>
    )
}