export interface IGraphEventUser {
    emailAddress: {
        name: string;
        address: string;
    }
}
export interface IGraphEventAttendee extends IGraphEventUser {
    type: "optional" | "required";
    status: {
        response: GraphEventResponse;
        time: string;
    };
}
export interface IGraphEventLocation {
    displayName: string,//"Microsoft Teams Meeting",
    locationType: "default",
    uniqueId: string,//"Microsoft Teams Meeting",
    uniqueIdType: "private" | "unknown"
}

export type GraphEventTimezone = "Eastern Standard Time" | "America/Toronto" | "UTC";
export type GraphEventType = "occurrence" | "singleInstance";
export type GraphEventResponse = "none" | "organizer" | "accepted";

export interface IGraphCalendar {
    id: string,
    createdDateTime: string,
    lastModifiedDateTime: string,
    changeKey: string,
    categories: string[],
    transactionId: null,
    originalStartTimeZone: GraphEventTimezone,
    originalEndTimeZone: GraphEventTimezone,
    iCalUId: string,
    reminderMinutesBeforeStart: number,
    isReminderOn: boolean,
    hasAttachments: boolean,
    subject: string,
    bodyPreview: string,
    importance: string,//"normal",
    sensitivity: string,// "normal",
    isAllDay: boolean,
    isCancelled: boolean,
    isOrganizer: boolean,
    responseRequested: boolean,
    seriesMasterId: string,//null,
    showAs: string,//"busy",
    type: GraphEventType,
    webLink: string,
    onlineMeetingUrl: string,//null,
    isOnlineMeeting: boolean,
    onlineMeetingProvider: "teamsForBusiness" | "unknown",
    allowNewTimeProposals: boolean,
    occurrenceId: string,//null,
    isDraft: boolean,
    hideAttendees: boolean,
    responseStatus: {
        response: GraphEventResponse,
        time: string
    },
    body: {
        contentType: "html",
        content: string,//"<html><head><body>....</html>"
    },
    start: {
        dateTime: string,
        timeZone: GraphEventTimezone,
    },
    end: {
        dateTime: string,
        timeZone: GraphEventTimezone,
    },
    location: IGraphEventLocation,
    locations: IGraphEventLocation[],
    recurrence: null,
    attendees: IGraphEventAttendee[],
    organizer: IGraphEventUser,
    onlineMeeting: {
        joinUrl: string
    }
}