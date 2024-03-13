export interface ITenantInfo {
    environment: AzureEnvironment;
    idOrName: string;
    authorityUrl: string;
    valid: boolean;
}

// eslint-disable-next-line no-shadow
export enum AzureEnvironment {
    Production = 0,
    PPE = 1,
    China = 2,
    Germany = 3,
    USGovernment = 4
}
/** AuthenticationModes enum values for projects that can't use enums (when isolatedModules is true)  
 * @deprecated use AzureEnvironment
 */
export const $AzureEnvironment = {
    Production: 0,
    PPE: 1,
    China: 2,
    Germany: 3,
    USGovernment: 4,
}

// eslint-disable-next-line no-shadow
export enum AuthenticationModes {
    Certificate = "certificate",
    clientSecret = "secret"
}
/** AuthenticationModes enum values for projects that can't use enums (when isolatedModules is true) */
export const $AuthenticationModes = {
    Certificate: AuthenticationModes.Certificate,
    clientSecret: AuthenticationModes.clientSecret,
};


export type AuthContextType = {
    authenticationMode: AuthenticationModes.Certificate,
    clientId: string,
    privateKey: string,
    thumbprint: string
} | {
    authenticationMode: AuthenticationModes.clientSecret,
    clientId: string,
    clientSecret: string
};