export class URLHelper {
    private queryStringParams: { [key: string]: string; };
    private hashParams: { [key: string]: string; };
    private path: string;

    public constructor(url: string) {
        let parts = url.split("#");
        let pathAndQueryString = parts[0];
        let hash = parts[1];
        let parts2 = pathAndQueryString.split("?");
        let path = parts2[0];
        let queryString = parts2[1];

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

    public removeQueryStringParam(keyName: string, bCaseInsensitive?: boolean) {
        this._removeParam(this.queryStringParams, keyName, bCaseInsensitive);
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
                let q = s.split("=");
                let paramKey = decodeURIComponent(q[0]);
                let paramValue = q[1];
                if (typeof (paramKey) === "string" && paramKey.length) {
                    paramsDict[paramKey] = typeof (paramValue) === "string" && paramValue.length ? paramValue : null;
                }
            });
        } catch (ex) {
        }
        return paramsDict;
    }

    private _removeParam(obj: { [key: string]: string; }, keyName: string, bCaseInsensitive?: boolean) {
        if (!obj) {
            return;
        }
        Object.keys(obj).filter((key) => {
            if (bCaseInsensitive === true) {
                return key.toLowerCase() === keyName.toLowerCase();
            }
            return key === keyName;
        }).forEach((key) => {
            try {
                delete obj[key];
            } catch {
            }
        });
    }

    private _getParam(obj: { [key: string]: string; }, keyName: string, bNoDecode?: boolean, bCaseInsensitive?: boolean) {
        let value: string = null;
        if (bCaseInsensitive) {
            let matchedKey = Object.keys(obj).filter((key) => {
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
        let queryString = Object.keys(this.queryStringParams).map((key) => {
            let value = this.queryStringParams[key];
            return `${key}` + (value !== null ? `=${value}` : "");
        });
        let hash = Object.keys(this.hashParams).map((key) => {
            var value = this.hashParams[key];
            return `${key}` + (value !== null ? `=${value}` : "");
        });
        let newUrl = [
            typeof (this.path) === "string" && this.path.length ? this.path : "",
            queryString && queryString.length ? `?${queryString.join("&")}` : "",
            hash && hash.length ? `#${hash.join("&")}` : ""
        ];
        return newUrl.join("");
    }
}