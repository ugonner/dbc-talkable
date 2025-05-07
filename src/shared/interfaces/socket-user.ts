export interface IProducerUser extends IUserReactions, IAccessibilityPreferences {
  userId?: string;
  userName?: string;
  avatar?: string;
  videoProducerId?: string;
  audioProducerId?: string;
  dataProducerId?: string;
  dataConsumerId?: string;
  
  socketId: string;
  isAudioTurnedOff: boolean;
  isVideoTurnedOff: boolean;
  mediaStream: MediaStream;
}


export interface IAccessibilityPreferences {
  usesTextualCommunication?: boolean;
}

export interface IUserReactions {
  
  raizingHand?: boolean;
  clapping?: boolean;
  laughing?: boolean;
  angry?: boolean;
  indifferent?: boolean;
  happy?: boolean;
  agreeing?: boolean;
  disagreeing?: boolean;
}
export interface IProducers {
  [socketId: string]: IProducerUser
}

export enum UserActions {
  RaizingHand = "raizingHand",
  Clapping = "clapping",
  Laughing = "laughing",
  Angry =  "angry",
  Indifferent = "indifferent",
  Happy = "happy",
  Agreeing = "agreeing",
  Disagreeing = "disagreeing" 
}

