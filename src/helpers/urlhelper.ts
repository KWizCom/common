export class URLHelper {
    private queryStringParams: { [key: string]: string; };
    private hashParams: { [key: string]: string; };
    private path: string;

    public constructor(url: string) {
        var parts = url.split("#");
        var pathAndQueryString = parts[0];
        var hash = parts[1];
        var parts2 = pathAndQueryString.split("?");
        var path = parts2[0];
        var queryString = parts2[1];

        this.path = path;
        this.queryStringParams = this._parseParams(queryString);
        this.hashParams = this._parseParams(hash);
    }

    public getQueryStringParam(keyName: string, bNoDecode?: boolean, bCaseInsensitive?: boolean) {
        return this._getParam(this.queryStringParams, keyName, bNoDecode, bCaseInsensitive);
    }

    public setQueryStringParam(keyName: string, keyValue: string, bEncode: boolean) {
        this.queryStringParams[keyName] = bEncode ? encodeURIComponent(keyValue) : keyValue;
        return this.getUrl();
    }

    public removeQueryStringParam(keyName: string) {
        this._removeParam(this.queryStringParams, keyName);
        return this.getUrl();
    }

    public getHashParam(keyName: string, bNoDecode?: boolean, bCaseInsensitive?: boolean) {
        return this._getParam(this.hashParams, keyName, bNoDecode, bCaseInsensitive);
    }

    public setHashParam(keyName: string, keyValue: string, bEncode: boolean) {
        this.hashParams[keyName] = bEncode ? encodeURIComponent(keyValue) : keyValue;
        return this.getUrl();
    }

    public removeHashParam(keyName: string) {
        this._removeParam(this.hashParams, keyName);
        return this.getUrl();
    }

    private _parseParams(paramsAsString: string) {
        var paramsDict: { [key: string]: string; } = {};
        try {
            (typeof (paramsAsString) === "string" && paramsAsString.length ? paramsAsString.split("&") : []).forEach((s) => {
                var q = s.split("=");
                var paramKey = decodeURIComponent(q[0]);
                var paramValue = q[1];
                if (typeof (paramKey) === "string" && paramKey.length) {
                    paramsDict[paramKey] = typeof (paramValue) === "string" && paramValue.length ? paramValue : null;
                }
            });
        } catch (ex) {
        }
        return paramsDict;
    }

    private _removeParam(obj: { [key: string]: string; }, keyName: string) {
        if (obj && obj[keyName]) {
            try {
                delete obj[keyName];
            } catch (ex) {
            }
        }
    }

    private _getParam(obj: { [key: string]: string; }, keyName: string, bNoDecode?: boolean, bCaseInsensitive?: boolean) {
        var value: string = null;
        if (bCaseInsensitive) {
            var matchedKey = Object.keys(obj).filter((key) => {
                return key.toLowerCase() === keyName.toLowerCase();
            })[0];

            if (matchedKey) {
                value = obj[matchedKey];
            }
        } else {
            value = obj[keyName];
        }
        return typeof (value) === "string" ? (bNoDecode ? value : decodeURIComponent(value)) : null;
    }

    public getUrl() {
        var queryString = Object.keys(this.queryStringParams).map((key) => {
            var value = this.queryStringParams[key];
            return `${key}` + (value !== null ? `=${value}` : "");
        });
        var hash = Object.keys(this.hashParams).map((key) => {
            var value = this.hashParams[key];
            return `${key}` + (value !== null ? `=${value}` : "");
        });
        var newUrl = [
            typeof (this.path) === "string" && this.path.length ? this.path : "",
            queryString && queryString.length ? `?${queryString.join("&")}` : "",
            hash && hash.length ? `#${hash.join("&")}` : ""
        ];
        return newUrl.join("");
    }
}