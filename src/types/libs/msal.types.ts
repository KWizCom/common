import { ITenantInfo } from "../auth";

export interface IMSALBaseRequest { scopes: string[]; }
export interface IMSALConfig { }

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