import { isNullOrEmptyString, isNullOrUndefined } from "../../helpers/typecheckers";
import { SPFxAuthTokenType } from "../../types/auth";
import { GetJson, shortLocalCache } from "../rest";
import { GetRestBaseUrl } from "../sharepoint.rest/common";

export function GetTokenAudiencePrefix(appId: string) {
    return `api://${appId}`;
}
export function GetDefaultScope(appId: string) {
    return `${GetTokenAudiencePrefix(appId)}/access_as_user`;
}
export function GetMSALSiteScope(hostName: string) {
    return `https://${hostName}`;
}

/** Acquire an authorization token for a Outlook, Graph, or SharePoint the same way SPFx clients do */
export async function GetSPFxClientAuthToken(siteUrl: string, spfxTokenType: SPFxAuthTokenType = SPFxAuthTokenType.Graph) {
    try {
        let acquireURL = `${GetRestBaseUrl(siteUrl)}/SP.OAuth.Token/Acquire`;

        //todo: add all the resource end points (ie. OneNote, Yammer, Stream)
        let resource = "";
        let isSPOToken = false;
        switch (spfxTokenType) {
            case SPFxAuthTokenType.Outlook:
                resource = "https://outlook.office365.com";
                break;
            case SPFxAuthTokenType.SharePoint:
            case SPFxAuthTokenType.MySite:
                isSPOToken = true;
                resource = new URL(acquireURL).origin;
                if (spfxTokenType === SPFxAuthTokenType.MySite) {
                    let split = resource.split(".");
                    split[0] += "-my";
                    resource = split.join(".");
                }
                break;
            case SPFxAuthTokenType.MySite:
                resource = new URL(acquireURL).origin
                break;
            default:
                resource = "https://graph.microsoft.com";
        }

        let data = {
            resource: resource,
            tokenType: isSPOToken ? "SPO" : undefined
        };

        let result = await GetJson<{
            access_token: string;
            expires_on: string;
            resource: string;
            scope: string;
            token_type: string;
        }>(
            acquireURL,
            JSON.stringify(data),
            {
                ...shortLocalCache,
                postCacheKey: `${spfxTokenType}_${_spPageContextInfo.webId}`,
                includeDigestInPost: true,
                headers: {
                    "Accept": "application/json;odata.metadata=minimal",
                    "content-type": "application/json; charset=UTF-8",
                    "odata-version": "4.0",
                }
            });

        return !isNullOrUndefined(result) && !isNullOrEmptyString(result.access_token) ? result.access_token : null;
    } catch {
    }
    return null;
}
