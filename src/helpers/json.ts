import { eval2 } from "./eval";
import { isFunction, isNullOrEmptyString } from "./typecheckers";

export function jsonParse<T = any>(str: string) {
    if (isNullOrEmptyString(str)) {
        return null;
    }

    if (JSON) {
        if (isFunction(JSON.parse)) {
            try {
                var v = JSON.parse(str);
                return v as T;
            } catch (ex) {
                return null;
            }
        }
    }
    try {
        var v2 = eval2("(" + str + ")");

        return v2 as T;
    } catch (ex1) {
        return null;
    }
}

/** stringify JSON object, but also sorts properties alphabetically */
export function jsonStringify(obj: any, space?: number): string {
    if (isNullOrEmptyString(obj)) return "";
    var allKeys = [];
    JSON.stringify(obj, (key, value) => {
        if (!allKeys.includes(key))
            allKeys.push(key);
        return value;
    });
    allKeys.sort();
    return JSON.stringify(obj, allKeys, space);
}
/** stringify json object without quotes on property names */
export function jsonStringifyNoQuotes(obj: any) {
    return jsonStringify(obj, 2).replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, function (match) {
        return match.replace(/"/g, "");
    });
}