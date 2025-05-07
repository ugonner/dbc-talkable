export enum ClientEvents {
    JOIN_ROOM = "join_room",
    GET_ROUTER_RTCCAPABILITIES = "get_router_rtc_capabilities",
    CREATE_TRANSPORT = "create_transport",
    CONNECT_TRANSPORT = "connect_tranport",
    PRODUCE = "produce",
    CONSUME = "consume",
    GET_ROOM_PRODUCERS = "get_room_producers",
    GET_ROOM_ADMINS = "get_room_admins",
    CONSUME_DATA = "consume_data",
    PRODUCE_DATA = "Produce_data"
}

export enum BroadcastEvents {
    PRODUCER_PRODUCING = "producing",
    PRODUCER_PAUSED = "producer_paused",
    PRODUCER_CLOSED = "producer_closed",
    PUBLISH_PRODUCER = "publishProducer",
    REQUEST_TO_PUBLISH = "requestToPublish",
    REQUEST_TO_JOIN = "requestToJoin",
    TOGGLE_PRODUCER_STATE = "toggleProducerState",
    JOIN_REQUEST_ACCEPTED = "join_request_accepted",
    JOIN_REQUEST_REJECTED = "join_request_rejected",
    USER_REACTION = "User_Reaction",
    GET_ROOM_CONTEXT = "Get_room_context",
    SCREEN_SHARING = "Screen_sharing",
    SCREEN_SHARING_STOPPED = "Screen_sharing_stopped",
    REQUEST_ACCESSIBLITY_PREFERENCE = "Request_accessibility_preference",
    ACCESSIBLITY_PREFERENCE_ACCEPTANCE = "Accessibility_preference_acceptance",
    ACCESSIBLITY_PREFERENCE_REJECTION = "Accessibility_preference_rejection",
    SPECIAL_PRESENTER_SELECTION = "Special_presenter_selection",
    ROOM_CONTEXT_MODIFICATION = "Room_context_modification",
    CAPTION = "Caption",
   CHAT_MESSAGE = "Chat_message",
   PRODUCER_PRODUCING_DATA = "producing_data",
   JOIN_REQUEST_REJECTEDD = "join_request_rejected",
   LEAVE_ROOM = "Leave_room",
   REQUEST_FOR_AID_PERSONNEL = "Request_for_aid_personnel",

    
}

