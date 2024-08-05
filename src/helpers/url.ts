import { IDictionary } from "./_dependencies";
import { ArrayFill, lastOrNull } from "./collections.base";
import { isNullOrEmptyString, isString } from "./typecheckers";
import { URLHelper } from "./urlhelper";

/**
 * Get query string parameter by name
 * @param name name of parameter
 * @param url optional, url. if not sent - current window.location.href will be used
 */
export function getQueryStringParameter(param: string, url?: string, caseInSensitive?: boolean) {
    let search = window.location.search;
    if (!isNullOrEmptyString(url)) {
        let tmp = url.split('#')[0].split('?');
        search = tmp.length > 1 ? tmp[1] : '';
    }

    return getParameterValue(param, search, caseInSensitive);
}
/**
 * Get url hash parameter by name
 * @param name name of parameter
 * @param url optional, url. if not sent - current window.location.href will be used
 */
export function getHashParameter(param: string, url?: string, caseInSensitive?: boolean) {
    let hash = window.location.hash;
    if (!isNullOrEmptyString(url)) {
        let tmp = url.split('#');
        hash = tmp.length > 1 ? tmp[1] : '';
    }
    return getParameterValue(param, hash, caseInSensitive);
}

/** return a value of a parameter from a key/value string like: key=value&key2=value2 */
export function getParameterValue(param: string, keyValueString: string, caseInSensitive?: boolean) {
    let _keyValueString = keyValueString.startsWith("#") || keyValueString.startsWith("?") ? keyValueString.substr(1) : keyValueString;
    var parsed = _keyValueString.split('&');
    for (var i = 0; i < parsed.length; i++) {
        var values = parsed[i].split('=');

        if (caseInSensitive ? values[0] === param : values[0].toLowerCase() === param.toLowerCase()) {
            let v = (values.length > 1 ? values[1] : param);
            return decodeURIComponent(v.replace(/\+/g, " "));
        }

        //ISSUE: 1301 - the query string parameter name was encoded in window.location.href/window.location.search even though in the 
        //url bar the paramter name was not encoded
        if (caseInSensitive ? decodeURIComponent(values[0]) === param : decodeURIComponent(values[0]).toLowerCase() === param.toLowerCase()) {
            let v = (values.length > 1 ? values[1] : param);
            return decodeURIComponent(v.replace(/\+/g, " "));
        }
    }
    return "";
}

/**
 * Make full url relative to current page location
 * @param url
 */
export function makeFullUrl(url: string, baseUrl?: string): string {
    if (isNullOrEmptyString(url)) url = baseUrl || window.location.href;

    if (url.indexOf('://') > 0) return url;
    else {
        if (url.startsWith('/') || url.startsWith('#')) {
            //server relative
            if (isNullOrEmptyString(baseUrl)) {//no override base
                var xxx = document.createElement("a");
                xxx.href = url;
                return xxx.href;
            }
            else//have override base
            {
                if (url.startsWith('#')) return `${baseUrl.split('#')[0]}${url}`;
                return `${baseUrl.split('/').slice(0, 3).join("/")}${url}`;
            }
        }
        else//folder relative URL, and we have a different baseURL to base it on
        {
            return makeFullUrl(makeServerRelativeUrl(url, baseUrl), baseUrl);
        }
    }
}

/** if the url is the same, only different hash parameter - reload the page. otherwise - navigate to the page */
export function navigateOrReload(urlWithHash: string) {
    if (makeServerRelativeUrl(urlWithHash).split('#')[0].toLowerCase() === makeServerRelativeUrl(window.location.href).split('#')[0].toLowerCase())
        window.location.reload();//can't change hash - it won't refresh page
    else
        window.location.href = urlWithHash;
}

/** baseUrl is optional full or server relative URL to build folder relative urls from. */
export function makeServerRelativeUrl(url: string, baseUrl?: string): string {
    if (isNullOrEmptyString(url)) url = baseUrl || window.location.href.split('?')[0];

    var index = url.indexOf("//");
    if (index > 0)//this is a full URL, just trim it from // until the first / and return.
    {
        index = url.indexOf("/", index + 2);//find next / after the ://domain.name
        if (index < 0) return "/";//not found - return "/" for the root.
        else return url.slice(index);//found - return from that "/" onwards.
    }
    else if (url.startsWith('/'))//server relative url already
        return url;
    else//folder relative url
    {
        let baseRelativeUrl = makeServerRelativeUrl(baseUrl || window.location.href);
        baseRelativeUrl = baseRelativeUrl.split('?')[0];
        //if ends with file name - strip it
        if (lastOrNull(baseRelativeUrl.split('/')).indexOf('.') >= 0)
            baseRelativeUrl = baseRelativeUrl.substr(0, baseRelativeUrl.lastIndexOf('/'));
        return normalizeUrl(baseRelativeUrl, true) + url;
    }
}

/** Normalizes URL ending, end with or without slash */
export function normalizeUrl(url: string, endWithSlash = false): string {
    var tmp = url;
    if (endWithSlash) {
        if (isNullOrEmptyString(tmp))
            tmp = "/";
        else if (tmp.substr(-1) !== "/")
            tmp += "/";
    }
    else {
        if (!isNullOrEmptyString(tmp) && tmp.endsWith('/'))
            tmp = tmp.slice(0, url.length - 1);
    }
    return tmp;
}

/** 
 * Returns the extension for a specified url string. Requires the URL polyfill for IE. 
 */
export function getURLExtension(url: string) {//, baseUri?: string) {
    if (!isString(url)) {
        return "";
    }
    //if (!isString(baseUri)) {
    //    baseUri = document.baseURI || window.location.protocol + "://" + window.location.hostname + window.location.pathname;
    //}
    var urlObj = new URL(url, "https://example.com");
    url = urlObj.href.replace(urlObj.host, "").replace(urlObj.hash, "").replace(urlObj.search, "");
    return url.substring(url.lastIndexOf("/") + 1).split(/#|\?/)[0].split(".").pop().trim();
}

export function isDataUrl(url: string) {
    let REGEXP_DATA_URL = /^data:(?:.+?\/.+?)?(?:;.+?=.+?)*(?:;base64)?,.*$/;
    return REGEXP_DATA_URL.test(url);
}

export function setUrlKeyValue(keyName: string, keyValue: string, bEncode: boolean, url?: string) {
    if (!isString(url)) {
        url = window.location.href + "";
    }

    let urlParams = new URLHelper(url);
    return urlParams.setQueryStringParam(keyName, keyValue, bEncode);
}

export function removeUrlKeyValue(keyName: string, url?: string, bCaseInsensitive?: boolean) {
    if (!isString(url)) {
        url = window.location.href + "";
    }

    let urlParams = new URLHelper(url);
    return urlParams.removeQueryStringParam(keyName, bCaseInsensitive);
}

/**
 * Returns encoded string from encodeURIComponent with single quote replaced with %27 or %27%27
 */
export function encodeURIComponentEX(str, options?: {
    /** use this flag when making a REST requst, and encoding a parameter surrounded by 'param'
     * for each level of '' your param is sorounded with
     * example: filename('par'am') > send 2 to make it filename('par''am')
     * example 2: sheet(' ''par'am'' ') > send 4 to make it sheet(' ''par''''am'' ')
     */
    singleQuoteMultiplier?: number;
}) {
    return encodeURIComponent(str).replace(/'/g, (s) => {
        return options && options.singleQuoteMultiplier > 1
            ? ArrayFill(new Array(options.singleQuoteMultiplier), "%27").join('')
            : `%27`;
    });
}

export function parseQueryString(url: string): IDictionary<string> {
    if (isNullOrEmptyString(url) || url.indexOf('?') < 0) return {};
    let strParams = url.split('?')[1].split('#')[0].split('&');
    let params: IDictionary<string> = {};
    strParams.forEach(p => {
        let keyValue = p.split("=");
        params[keyValue[0]] = decodeURIComponent(keyValue[1] || "");
    });
    return params;
}
export function parseHash(url: string): IDictionary<string> {
    if (isNullOrEmptyString(url) || url.indexOf('#') < 0) return {};
    let strParams = url.split('#')[1].split('&');
    let params: IDictionary<string> = {};
    strParams.forEach(p => {
        let keyValue = p.split("=");
        params[keyValue[0]] = decodeURIComponent(keyValue[1] || "");
    });
    return params;
}