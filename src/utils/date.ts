import { isBoolean, isFunction } from "../helpers/typecheckers";
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
}): string {
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

export function dateFormat(date: Date, format: string) {
    let strResult = "";
    //collect strings in the format, up to 4 in a row.
    let currentChar = "";
    let currentToken = "";

    var appendToken = (token: string) => {
        let ensureNumberOfLetters = 0;
        let result: string = token;
        let numTmp: number;
        switch (token) {
            case "d":
                result = date.getDate().toString(10);
                break;
            case "dd":
                result = date.getDate().toString(10);
                ensureNumberOfLetters = 2;
                break;
            case "ddd":
                result = Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
                break;
            case "dddd":
                result = Intl.DateTimeFormat(undefined, { weekday: "long" }).format(date);
                break;
            case "h":
                numTmp = date.getHours();
                if (numTmp > 12) numTmp -= 12;
                if (numTmp === 0) numTmp = 12;
                result = numTmp.toString(10);
                break;
            case "hh":
                numTmp = date.getHours();
                if (numTmp > 12) numTmp -= 12;
                if (numTmp === 0) numTmp = 12;
                result = numTmp.toString(10);
                ensureNumberOfLetters = 2;
                break;
            case "H":
                result = date.getHours().toString(10);
                break;
            case "HH":
                result = date.getHours().toString(10);
                ensureNumberOfLetters = 2;
                break;
            case "m":
                result = date.getMinutes().toString(10);
                break;
            case "mm":
                result = date.getMinutes().toString(10);
                ensureNumberOfLetters = 2;
                break;
            case "M":
                result = (date.getMonth() + 1).toString(10);
                break;
            case "MM":
                result = (date.getMonth() + 1).toString(10);
                ensureNumberOfLetters = 2;
                break;
            case "MMM":
                result = Intl.DateTimeFormat(undefined, { month: "short" }).format(date);
                break;
            case "MMMM":
                result = Intl.DateTimeFormat(undefined, { month: "long" }).format(date);
                break;
            case "s":
                result = date.getSeconds().toString(10);
                break;
            case "ss":
                result = date.getSeconds().toString(10);
                ensureNumberOfLetters = 2;
                break;
            case "t":
            case "tt":
                numTmp = date.getHours();
                result = Intl.DateTimeFormat(undefined, { hour12: true, hour: "2-digit" }).format(date).split(" ")[1];
                break;
            case "y":
                result = date.getFullYear().toString(10).slice(2);
                break;
            case "yy":
                result = date.getFullYear().toString(10).slice(1);
                result = result.padStart(token.length, "0");
                break;
            case "yyy":
            case "yyyy":
                result = date.getFullYear().toString(10);
                result = result.padStart(token.length, "0");
                break;
            case "K":
            case "z":
            case "zz":
            case "zzz":
                result = "";
                break;
            case "f":
                result = date.getMilliseconds().toString(10).slice(0, 1);
                break;
            case "ff":
                result = date.getMilliseconds().toString(10).slice(0, 2);
                break;
            case "fff":
                result = date.getMilliseconds().toString(10).slice(0, 3);
                break;
            case "ffff":
                result = date.getMilliseconds().toString(10).slice(0, 4);
                break;
            case "fffff":
                result = date.getMilliseconds().toString(10).slice(0, 5);
                break;
            case "ffffff":
                result = date.getMilliseconds().toString(10).slice(0, 6);
                break;
            case "fffffff":
                result = date.getMilliseconds().toString(10).slice(0, 7);
                break;
        }

        while (ensureNumberOfLetters > result.length)
            result = "0" + result;
        return result;
    };

    for (var i = 0; i < format.length; i++) {
        let char = format[i];
        if (char === currentChar) {
            currentToken += char;
        } else {
            strResult += appendToken(currentToken);
            currentToken = char;
            currentChar = char;
        }
    }
    strResult += appendToken(currentToken);

    return strResult;
}