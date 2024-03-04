import { AzureEnvironment, ITenantInfo, isNullOrEmptyString, isValidGuid, promiseOnce } from "../_dependencies";
import { GetJson } from "../rest";

export function DiscoverTenantInfo(hostName: string) {
    hostName = hostName.toLowerCase();
    return promiseOnce(`DiscoverTenantInfo|${hostName}`, async () => {
        let data: ITenantInfo = {
            environment: AzureEnvironment.Production,
            idOrName: null,
            authorityUrl: null,
            valid: false
        };

        let tenantId: string = null;
        let friendlyName: string = null;

        try {
            if (hostName.indexOf(".sharepoint.") !== -1) {
                let hostParts = hostName.split('.');//should be xxx.sharepoint.com or xxx.sharepoint.us
                let firstHostPart = hostParts[0];
                let lastHostPart = hostParts[hostParts.length - 1] === "us" || hostParts[hostParts.length - 1] === "de" ? hostParts[hostParts.length - 1] : "com";
                if (firstHostPart.endsWith("-admin")) firstHostPart = firstHostPart.substring(0, firstHostPart.length - 6);
                friendlyName = `${firstHostPart}.onmicrosoft.${lastHostPart}`;
            }
            else friendlyName = hostName;//could be an exchange email domain, or bpos customer

            let config = await GetJson<{
                token_endpoint: string;//https://login.microsoftonline.com/7d034656-be03-457d-8d82-60e90cf5f400/oauth2/token
                cloud_instance_name: string;//microsoftonline.com
                token_endpoint_auth_methods_supported: string[];// ["client_secret_post", "private_key_jwt", "client_secret_basic"]
                response_modes_supported: string[];// ["query", "fragment", "form_post"]
                response_types_supported: string[];// ["code", "id_token", "code id_token", "token id_token", "token"]
                scopes_supported: string[];// ["openid"]
                issuer: string;//https://sts.windows.net/7d034656-be03-457d-8d82-60e90cf5f400/
                authorization_endpoint: string;//https://login.microsoftonline.com/7d034656-be03-457d-8d82-60e90cf5f400/oauth2/authorize
                device_authorization_endpoint: string;//https://login.microsoftonline.com/7d034656-be03-457d-8d82-60e90cf5f400/oauth2/devicecode
                end_session_endpoint: string;//https://login.microsoftonline.com/7d034656-be03-457d-8d82-60e90cf5f400/oauth2/logout
                userinfo_endpoint: string;//https://login.microsoftonline.com/7d034656-be03-457d-8d82-60e90cf5f400/openid/userinfo
                tenant_region_scope: string;//NA
                cloud_graph_host_name: string;//graph.windows.net
                msgraph_host: string;//graph.microsoft.com
            }>(`https://login.microsoftonline.com/${friendlyName}/v2.0/.well-known/openid-configuration`);

            let endpoint = config.token_endpoint;//https://xxxx/{tenant}/....
            tenantId = endpoint.replace("//", "/").split('/')[2];//replace :// with :/ split by / and take the second part.
            let instance = config.cloud_instance_name;//microsoftonline.us

            data.environment = GetEnvironmentFromACSEndPoint(instance);
            if (!isNullOrEmptyString(tenantId) || isValidGuid(tenantId))
                data.idOrName = tenantId;
            else
                data.idOrName = friendlyName;

            data.authorityUrl = `${GetAzureADLoginEndPoint(data.environment)}/${data.idOrName}`;
            data.valid = true;
        }
        catch (e) { }

        return data;
    });
}

export function AutoDiscoverTenantInfo() {
    return DiscoverTenantInfo(window.location.hostname.toLowerCase());
}

export function GetEnvironmentFromACSEndPoint(ACSEndPoint: string): AzureEnvironment {
    switch (ACSEndPoint) {
        case "microsoftonline.us":
            return AzureEnvironment.USGovernment;
        case "microsoftonline.de":
            return AzureEnvironment.Germany;
        case "accesscontrol.chinacloudapi.cn":
            return AzureEnvironment.China;
        case "windows-ppe.net":
            return AzureEnvironment.PPE;
        case "accesscontrol.windows.net":
        default:
            return AzureEnvironment.Production;
    }
}
export function GetAzureADLoginEndPoint(environment: AzureEnvironment): string {
    switch (environment) {
        case AzureEnvironment.Germany: return "https://login.microsoftonline.de";
        case AzureEnvironment.China: return "https://login.chinacloudapi.cn";
        case AzureEnvironment.USGovernment: return "https://login.microsoftonline.us";
        case AzureEnvironment.PPE: return "https://login.windows-ppe.net";
        case AzureEnvironment.Production:
        default:
            return "https://login.microsoftonline.com";
    }
}
