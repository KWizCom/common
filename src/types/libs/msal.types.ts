export interface IMSALBaseRequest { scopes: string[]; }
export interface IMSALConfig { }
export interface ITenantInfo {
    environment: AzureEnvironment;
    idOrName: string;
    authorityUrl: string;
    valid: boolean;
}

// eslint-disable-next-line no-shadow
export enum AzureEnvironment {
    /// <summary>
    /// 
    /// </summary>
    Production = 0,
    /// <summary>
    /// 
    /// </summary>
    PPE = 1,
    /// <summary>
    /// 
    /// </summary>
    China = 2,
    /// <summary>
    /// 
    /// </summary>
    Germany = 3,
    /// <summary>
    /// 
    /// </summary>
    USGovernment = 4
}

export const MSALSampleLoginPopupScript = `<p id="msg">please wait...</p>
<script>
function finish() {
    try {
        var hash = window.location.hash;
        if (hash[0] === "#") hash = hash.slice(1);//get rid of #
        var hashDictionary = {};
        hash.split("&").forEach(function (keyValue) {
            if (keyValue !== "") {
                var vals = keyValue.split("=");
                hashDictionary[vals[0]] = decodeURIComponent(vals[1]);
            }
        });
        if (Object.keys(hashDictionary).length < 1)
            window.close();//we lose the hash!
        else if (hashDictionary.error && hashDictionary.error_description)
            document.getElementById("msg").innerHTML = hashDictionary.error_description.replace(/\\+/g," ").replace(/\\n/g,"<br /><br />");
        else if (hashDictionary.state) {
            var origin = hashDictionary.state.split("|")[1];
            if (origin) {
                window.location.href = origin.split("#")[0] + window.location.hash;
            }
        }
    } catch (e) { }
}
finish();
</script>`;

export function GetTokenAudiencePrefix(appId: string) {
    return `api://${appId}`;
}
export function GetDefaultScope(appId: string) {
    return `${GetTokenAudiencePrefix(appId)}/access_as_user`;
}

export interface IMSAL {
    AutoDiscoverTenantInfo: () => Promise<ITenantInfo>;
    GetConfig: (clientId: string, authority: string, redirectUri: string) => Promise<IMSALConfig>;
    GetTokenPopup: (config: IMSALConfig, requestOptions?: { scopes?: string[]; }) => Promise<string>;
}

declare global {
    interface IKWizComGlobalsLibs {
        msal?: IMSAL;
    }
}
