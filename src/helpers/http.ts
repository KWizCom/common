import { objectValues } from "./objects";
import { isNullOrUndefined } from "./typecheckers";

// eslint-disable-next-line no-shadow
export enum CommonHttpHeaderNames {
    Accept = "Accept",
    Authorization = "Authorization",
    ContentType = "content-type",
    XHTTPMethod = "X-HTTP-Method",
    XRapidApiHost = "x-rapidapi-host",
    XRapidApiKey = "x-rapidapi-key"
}

// eslint-disable-next-line no-shadow
enum AcceptOrContentTypeHeaderValues {
    JsonVerbose = "application/json; odata=verbose",
    JsonMinimal = "application/json; odata=minimal",
    JsonNometadata = "application/json; odata=nometadata"
}

// eslint-disable-next-line no-shadow
enum AuthorizationHeaderValues {
    Bearer = "Bearer [token]",
    Basic = "Basic [user]:[password]"
}

// eslint-disable-next-line no-shadow
enum XHttpMethodHeaderValues {
    MERGE = "MERGE",
    DELETE = "DELETE",
    PUT = "PUT"
}

export function GetCommonHeaderNames() {
    return objectValues<CommonHttpHeaderNames>(CommonHttpHeaderNames);
}

export function GetCommonHeaderValueSuggestions(headerName: CommonHttpHeaderNames | string) {
    if (isNullOrUndefined(headerName)) {
        return [];
    }

    let parsedHeaderName = _getValueByKeyForStringEnum(headerName);

    if (isNullOrUndefined(parsedHeaderName)) {
        return [];
    }

    switch (parsedHeaderName) {
        case CommonHttpHeaderNames.Accept:
        case CommonHttpHeaderNames.ContentType:
            return objectValues<AcceptOrContentTypeHeaderValues>(AcceptOrContentTypeHeaderValues);
        case CommonHttpHeaderNames.Authorization:
            return objectValues<AuthorizationHeaderValues>(AuthorizationHeaderValues);
        case CommonHttpHeaderNames.XHTTPMethod:
            return objectValues<XHttpMethodHeaderValues>(XHttpMethodHeaderValues);
        default:
            return [];
    }
}

function _getValueByKeyForStringEnum(keyOrValue: string | CommonHttpHeaderNames) {
    let found = objectValues<CommonHttpHeaderNames>(CommonHttpHeaderNames).filter((value) => {
        return value === keyOrValue;
    })[0];
    if (isNullOrUndefined(found)) {
        found = CommonHttpHeaderNames[keyOrValue as keyof typeof CommonHttpHeaderNames];
    }
    return found;
}