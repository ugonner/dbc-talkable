import { IonLoading, IonModal } from "@ionic/react";
import React, { createContext, Dispatch, SetStateAction, useContext, useState } from "react";
import { Loader } from "../components/Loader";

export interface ILoadingProps {
    isLoading: boolean;
    loadingMessage: string;
}

export interface IErrorProps {
    isError: boolean;
    errorMessage: string;
    errorDismissal?: Function
}
export interface IAsyncProps {
    loading: ILoadingProps
    setLoading: Dispatch<SetStateAction<ILoadingProps>>;
    error: IErrorProps;
    setError: Dispatch<SetStateAction<IErrorProps>>;
}

const AsyncContext: React.Context<IAsyncProps> = createContext({} as IAsyncProps);

export const AsyncHelperProvider = ({children}: React.PropsWithChildren) => {
    const [loading, setLoading] = useState<ILoadingProps>({isLoading: false, loadingMessage: ""});
    const [error, setError] = useState<IErrorProps>({isError: false, errorMessage: ""});
    const initAsyncHelperProps: IAsyncProps = {
        error,
        setError,
        loading,
        setLoading
    };

    return (
        <AsyncContext.Provider value={initAsyncHelperProps}>
            <div>
                <Loader />
            </div>
            {children}
            
                <IonLoading isOpen={loading.isLoading} onDidDismiss={() => setLoading({loadingMessage: "", isLoading: false})} message={loading.loadingMessage} duration={5000} backdropDismiss={true}></IonLoading>
            
        </AsyncContext.Provider>
    )
}

export const useAsyncHelpersContext = () => useContext(AsyncContext);
