export type ICSFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type ICSDay = "SU" | "MO" | "TU" | "WE" | "TH" | "FR" | "SA";

export type ICS = () => {
    /** add an event to this ICS file. begin and end need to be formatted in a way that is friendly to Date() -- Issue 572 */
    addEvent(subject: string, description: string | {
        /** non-outlook standard */
        text: string;
        /** special support for outlook, html */
        html: string;
    }, location: string, begin: string, end: string, recurrence?: {
        freq: ICSFrequency;
        /** A date string representing the date on which to end repitition. Must be friendly to Date() */
        until?: string;
        /** Alternative to until. Repeat the event count times. Must be an integer */
        count?: number;
        /** The interval of freq to recur at. For example, if freq is WEEKLY and interval is 2, the event will repeat every 2 weeks. Must be an integer. */
        interval?: number;
        /** Which days of the week the event is to occur. An array containing any of SU, MO, TU, WE, TH, FR, SA. */
        byday?: ICSDay;
    }): void;
    /** get the ICS file content of the events added so far */
    calendar(): string;
    download(filename: string, extention?: string): void;
};

declare global {
    interface IKWizComGlobalsLibs {
        ics?: ICS;
    }
}