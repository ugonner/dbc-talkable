export interface ICaptionProps {
    mediaStream: MediaStream;
}

export const Caption = ({}: ICaptionProps) => {
    const startCaption = async (screen: MediaStream) => {
        try{
            
        }catch(error){
            console.log("Error handling caption", (error as Error).message)
        }
    }
}