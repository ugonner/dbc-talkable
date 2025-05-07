import React, { useState } from 'react';
import { IonApp, IonContent, IonFab, IonFabButton, IonFabList, IonIcon, IonModal } from '@ionic/react';
import { add, share, heart, pencil } from 'ionicons/icons';
import { CreateRoom } from '../../pages/video-conferencing/CreateRoom';

export const CreateEventsFAB: React.FC = () => {
  
    const [openCreateEventModal, setCreateEventModal] = useState(false);
  const [openCreateEventOverlay, setOpenCreateEventOverlay] = useState(false);
    return (
      <>
      
            <IonModal 
            isOpen={openCreateEventOverlay}
            onDidDismiss={() => setOpenCreateEventOverlay(false)}
            >
              <CreateRoom onSuccess={() => setOpenCreateEventOverlay(false)} roomType="instant"></CreateRoom>
            </IonModal>

        {/* Main FAB button with an expandable action list */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton>
            <IonIcon icon={add} />
          </IonFabButton>

          {/* Expandable list of action buttons */}
          <IonFabList side="top">
            
            <IonFabButton onClick={() => setOpenCreateEventOverlay(!openCreateEventOverlay)}>
              <IonIcon icon={pencil} />
            </IonFabButton>
          </IonFabList>
        </IonFab>
      </>
  );
};

