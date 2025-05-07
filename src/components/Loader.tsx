import { IonSpinner, IonText } from "@ionic/react";
import { useAsyncHelpersContext } from "../contexts/async-helpers"

export const Loader = () => {
    const {loading} = useAsyncHelpersContext();
    return (
        <IonText>
            {loading.isLoading && (
                <small><IonSpinner /> </small>
            )}
        </IonText>
    )
}