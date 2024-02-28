import { isBoolean, isFunction } from "./_dependencies";
import { LocaleKnownScript } from "./knownscript";

/** return date format as yyyy-MM-ddTHH:mm:ssZ
 * Optionally: remove Z, remove seconds, or set time to zero
 */
export function toIsoDateFormat(date: Date, options?: {
    zeroTime?: boolean;
    /** remove trailing Z (add do not add local time offset) */
    omitZ?: boolean;
    omitSeconds?: boolean;
    addLocalTimezoneOffset?: boolean;
}) {
    let omitZ = options && options.omitZ === true || false;
    let omitSeconds = options && options.omitSeconds === true || false;
    let zeroTime = options && options.zeroTime === true || false;

    let addLocalTimezoneOffset = options && isBoolean(options.addLocalTimezoneOffset)
        ? options.addLocalTimezoneOffset
        : omitZ !== true;

    let format = `yyyy-MM-ddT${zeroTime ? '00:00' : 'HH:mm'}${omitSeconds ? '' : zeroTime ? ':00' : ':ss'}${omitZ ? '' : 'Z'}`;

    if (!isFunction(date.format)) {
        LocaleKnownScript.loadSync();
    }

    let oDate = new Date(date.getTime());
    if (addLocalTimezoneOffset) {
        //If we do not omit Z, the caller wants to get the object's UTC time.
        //Date format will get the current local time - so we need to compensate.
        oDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    }
    let o = oDate.format(format);
    return o;
}