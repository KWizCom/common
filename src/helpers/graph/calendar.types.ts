import { IGraphEventAttendee, IGraphEventUser } from "../../types/graph/calendar.types";
import { isNullOrEmptyString } from "../typecheckers";

export function IsGraphEventUser(obj: any): obj is IGraphEventUser {
    let asEA = obj as IGraphEventUser;
    return asEA && asEA.emailAddress && !isNullOrEmptyString(asEA.emailAddress.address);
}
export function IsGraphEventAttendee(obj: any): obj is IGraphEventAttendee {
    let asEA = obj as IGraphEventAttendee;
    return IsGraphEventUser(obj) && asEA.status && !isNullOrEmptyString(asEA.type);
}