export function GetTokenAudiencePrefix(appId: string) {
    return `api://${appId}`;
}
export function GetDefaultScope(appId: string) {
    return `${GetTokenAudiencePrefix(appId)}/access_as_user`;
}
export function GetMSALSiteScope(siteUrl: string) {
    return `https://${new URL(siteUrl).hostname}`;
}
