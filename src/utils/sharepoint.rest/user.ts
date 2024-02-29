import { IGroupInfo, ISPPeoplePickerControlFormEntity, IUserInfo, IsSPPeoplePickerControlFormEntity, PrincipalType, contentTypes, encodeURIComponentEX, getPrincipalTypeFromPickerEntity, isNullOrEmptyArray, isNullOrEmptyString, isNullOrNaN, isNullOrUndefined, isNumber, jsonStringify, jsonTypes } from "../_dependencies";
import { ConsoleLogger } from "../consolelogger";
import { GetJson, GetJsonSync, longLocalCache, shortLocalCache } from "../rest";
import { GetRestBaseUrl, GetSiteUrl } from "./common";
import { GetSiteId } from "./web";

const logger = ConsoleLogger.get("utils/sharepoint/user");
var __currentUserId: number = null;
const groupSelect = "Id,Title,Description,CanCurrentUserViewMembership,OnlyAllowMembersViewMembership,IsHiddenInUI,OwnerTitle";
const userSelect = "PrincipalType,Id,LoginName,UserPrincipalName,Title,IsSiteAdmin,Email";


/** Get user login name */
export function GetUserLoginName(siteUrl?: string): Promise<string> {
    siteUrl = GetSiteUrl(siteUrl);

    if (typeof (_spPageContextInfo) !== "undefined" && typeof (_spPageContextInfo.userPrincipalName) !== "undefined")
        //issue 6309 _spPageContextInfo.userLoginName is wrong for external users
        return Promise.resolve(_spPageContextInfo.userPrincipalName);

    return GetJson<{ d: { LoginName: string; }; }>(GetRestBaseUrl(siteUrl) + "/web/currentUser/loginName", null, { ...longLocalCache })
        .then(r => r.d.LoginName)
        .catch<string>(() => null);
}

/** Get user login name syncronously */
export function GetUserLoginNameSync(siteUrl?: string): string {
    siteUrl = GetSiteUrl(siteUrl);

    if (typeof (_spPageContextInfo) !== "undefined" && typeof (_spPageContextInfo.userPrincipalName) !== "undefined")
        //issue 6309 _spPageContextInfo.userLoginName is wrong for external users
        return _spPageContextInfo.userPrincipalName;

    let res = GetJsonSync<{ d: { LoginName: string; }; }>(GetRestBaseUrl(siteUrl) + "/web/currentUser/loginName", null, { ...longLocalCache });
    if (res.success)
        return res.result.d.LoginName;
    else return null;
}

function _getCurrentUserRequestUrl(siteUrl: string, expandGroups: boolean) {
    siteUrl = GetSiteUrl(siteUrl);

    var url = `${GetRestBaseUrl(siteUrl)}/web/currentUser${expandGroups ? '?$expand=Groups' : ''}`;
    return url;
}

export async function GetCurrentUser(siteUrl?: string, options?: { expandGroups: boolean; refreshCache?: boolean; }): Promise<IUserInfo> {
    siteUrl = GetSiteUrl(siteUrl);

    return GetJson<IUserInfo>(_getCurrentUserRequestUrl(siteUrl, options && options.expandGroups), null,
        {
            ...shortLocalCache, jsonMetadata: jsonTypes.nometadata,
            allowCache: !options || options.refreshCache !== true
        })
        .then(user => {
            if (user)
                __currentUserId = user.Id;
            return user;
        })
        .catch<IUserInfo>(() => null);
}

export function GetCurrentUserSync(siteUrl?: string, options?: { expandGroups: boolean; }): IUserInfo {
    siteUrl = GetSiteUrl(siteUrl);

    let res = GetJsonSync<IUserInfo>(_getCurrentUserRequestUrl(siteUrl, options && options.expandGroups), null,
        { ...shortLocalCache, jsonMetadata: jsonTypes.nometadata });
    if (res.success) {
        let user = res.result;
        if (user)
            __currentUserId = user.Id;

        return user;
    }
    else return null;
}

function _getUserRequestUrl(siteUrl: string, userId: number, expandGroups: boolean) {
    siteUrl = GetSiteUrl(siteUrl);

    var url = `${GetRestBaseUrl(siteUrl)}/web/GetUserById(${userId})${expandGroups ? '?expand=Groups' : ''}`;
    return url;
}

export async function GetUser(siteUrl?: string, userId?: number, options?: { expandGroups: boolean; }): Promise<IUserInfo> {
    siteUrl = GetSiteUrl(siteUrl);

    if (isNullOrNaN(userId) || __currentUserId === userId) return GetCurrentUser(siteUrl, options);
    return GetJson<IUserInfo>(_getUserRequestUrl(siteUrl, userId, options && options.expandGroups), null, {
        ...shortLocalCache, jsonMetadata: jsonTypes.nometadata
    }).then(user => {
        return user;
    }).catch<IUserInfo>(() => null);
}

export function GetUserSync(siteUrl?: string, userId?: number, options?: { expandGroups: boolean; }): IUserInfo {
    siteUrl = GetSiteUrl(siteUrl);

    if (isNullOrNaN(userId) || __currentUserId === userId) return GetCurrentUserSync(siteUrl, options);

    let res = GetJsonSync<IUserInfo>(_getUserRequestUrl(siteUrl, userId, options && options.expandGroups), null,
        { ...shortLocalCache, jsonMetadata: jsonTypes.nometadata });
    if (res.success) {
        let user = res.result;
        return user;
    }
    else return null;
}

function _getUserByLoginNameRequestUrl(siteUrl: string, loginName: string, expandGroups: boolean) {
    siteUrl = GetSiteUrl(siteUrl);

    var url = `${GetRestBaseUrl(siteUrl)}/web/siteUsers/getByLoginName(@u)?@u='${encodeURIComponentEX(loginName, { singleQuoteMultiplier: 2 })}'${expandGroups ? '&expand=Groups' : ''}`;
    return url;
}

export async function GetUserByLogin(siteUrl?: string, loginName?: string, options?: { expandGroups: boolean; }): Promise<IUserInfo> {
    siteUrl = GetSiteUrl(siteUrl);

    if (isNullOrEmptyString(loginName)) {
        return GetCurrentUser(siteUrl, options);
    }

    return GetJson<IUserInfo>(_getUserByLoginNameRequestUrl(siteUrl, loginName, options && options.expandGroups), null,
        { ...shortLocalCache, jsonMetadata: jsonTypes.nometadata })
        .then(user => user)
        .catch<IUserInfo>(() => null);
}

export function GetUserByLoginSync(siteUrl?: string, loginName?: string, options?: { expandGroups: boolean; }): IUserInfo {
    siteUrl = GetSiteUrl(siteUrl);

    if (isNullOrEmptyString(loginName)) {
        return GetCurrentUserSync(siteUrl, options);
    }

    let res = GetJsonSync<IUserInfo>(_getUserByLoginNameRequestUrl(siteUrl, loginName, options && options.expandGroups), null,
        { ...shortLocalCache, jsonMetadata: jsonTypes.nometadata });
    if (res.success) {
        let user = res.result;
        return user;
    }

    return null;
}

function _getEnsureUserRequestUrl(siteUrl: string, loginName: string, expandGroups?: boolean) {
    siteUrl = GetSiteUrl(siteUrl);

    var url = `${GetRestBaseUrl(siteUrl)}/web/ensureUser(@u)?@u='${encodeURIComponentEX(loginName, { singleQuoteMultiplier: 2 })}'${expandGroups ? '&expand=Groups' : ''}`;
    return url;
}

export async function EnsureUser(siteUrl: string, userLogin: string, options?: { expandGroups: boolean; }): Promise<IUserInfo> {
    siteUrl = GetSiteUrl(siteUrl);

    if (isNullOrEmptyString(userLogin)) return null;

    return GetJson<IUserInfo>(_getEnsureUserRequestUrl(siteUrl, userLogin, options && options.expandGroups), null,
        { method: "POST", spWebUrl: siteUrl, jsonMetadata: jsonTypes.nometadata, ...shortLocalCache })
        .then(user => {
            return user;
        })
        .catch<IUserInfo>(() => null);
}

export function EnsureUserSync(siteUrl: string, userLogin: string, options?: { expandGroups: boolean; }): IUserInfo {
    siteUrl = GetSiteUrl(siteUrl);

    if (isNullOrEmptyString(userLogin)) return null;

    let res = GetJsonSync<IUserInfo>(_getEnsureUserRequestUrl(siteUrl, userLogin, options && options.expandGroups), null,
        { method: "POST", spWebUrl: siteUrl, jsonMetadata: jsonTypes.nometadata, ...shortLocalCache });
    if (res.success) {
        let user = res.result;
        return user;
    }
    return null;
}

export function GetOrEnsureUserByLoginSync(siteUrl: string, key: string, options?: { expandGroups: boolean; }) {
    let userValue = GetUserByLoginSync(siteUrl, key, options);
    if (!userValue) {
        userValue = EnsureUserSync(siteUrl, key, options);
    }
    return userValue;
}

export async function GetSecurityGroupByTitle(siteUrl: string, title: string): Promise<IUserInfo> {
    siteUrl = GetSiteUrl(siteUrl);
    //on premise the title/name of security group could be as domain login
    //for example, 'KWIZCOM\ad_qa_group'
    //split[0] = will contain the domain name (KWIZCOM)
    //split[1] = will contain the title (ad_qa_group)
    //if split[1] is null, then we didn't get a domain login and the split[0] will just contain the title/name (ad_qa_group) of the group
    var split = title.split("\\");
    var groupTitle = (split[1] || split[0]).toLowerCase();
    var url = `${GetRestBaseUrl(siteUrl)}/web/siteusers?$filter=PrincipalType eq ${PrincipalType.SecurityGroup}`;

    return GetJson<{ value: IUserInfo[]; }>(url, null,
        { method: "GET", jsonMetadata: jsonTypes.nometadata, ...shortLocalCache })
        .then(securityGroupsResult => {
            var securityGroup: IUserInfo = null;
            if (securityGroupsResult && securityGroupsResult.value && securityGroupsResult.value.length) {
                //first match the full title and fall back to the split title/name
                securityGroup = securityGroupsResult.value.filter((secGroup) => {
                    //this will find security groups on premise where the title/name are saved as 'KWIZCOM\ad_qa_group'
                    //but will not match when exporting from on premise to online
                    return secGroup.Title.toLowerCase() === title.toLowerCase();
                })[0] || securityGroupsResult.value.filter((secGroup) => {
                    //this will match settings exported from on premise to online where the title/name of the group changes from 'KWIZCOM\ad_qa_group' to 'AD_QA_GROUP'
                    return secGroup.Title.toLowerCase() === groupTitle;
                })[0];
            }
            return securityGroup;
        })
        .catch<IUserInfo>(() => null);
}

export function GetSecurityGroupByTitleSync(siteUrl: string, title: string): IUserInfo {
    siteUrl = GetSiteUrl(siteUrl);
    //on premise the title/name of security group could be as domain login
    //for example, 'KWIZCOM\ad_qa_group'
    //split[0] = will contain the domain name (KWIZCOM)
    //split[1] = will contain the title (ad_qa_group)
    //if split[1] is null, then we didn't get a domain login and the split[0] will just contain the title/name (ad_qa_group) of the group
    var split = title.split("\\");
    var groupTitle = (split[1] || split[0]).toLowerCase();
    var url = `${GetRestBaseUrl(siteUrl)}/web/siteusers?$filter=PrincipalType eq ${PrincipalType.SecurityGroup}`;

    let securityGroupsResult = GetJsonSync<{ value: IUserInfo[]; }>(url, null,
        { method: "GET", jsonMetadata: jsonTypes.nometadata, ...shortLocalCache });

    if (securityGroupsResult && securityGroupsResult.success) {
        var securityGroup: IUserInfo = null;
        if (securityGroupsResult && securityGroupsResult.result && securityGroupsResult.result.value && securityGroupsResult.result.value.length) {
            //first match the full title and fall back to the split title/name
            securityGroup = securityGroupsResult.result.value.filter((secGroup) => {
                //this will find security groups on premise where the title/name are saved as 'KWIZCOM\ad_qa_group'
                //but will not match when exporting from on premise to online
                return secGroup.Title.toLowerCase() === title.toLowerCase();
            })[0] || securityGroupsResult.result.value.filter((secGroup) => {
                //this will match settings exported from on premise to online where the title/name of the group changes from 'KWIZCOM\ad_qa_group' to 'AD_QA_GROUP'
                return secGroup.Title.toLowerCase() === groupTitle;
            })[0];
        }
        return securityGroup;
    }
    return null;
}

function _getGroupRequestUrl(siteUrl: string, groupId: number) {
    siteUrl = GetSiteUrl(siteUrl);

    var url = `${GetRestBaseUrl(siteUrl)}/web/siteGroups/getById(${groupId})?$select=${groupSelect}`;
    return url;
}

function _getGroupUsersRequestUrl(siteUrl: string, groupId: number) {
    siteUrl = GetSiteUrl(siteUrl);

    var url = `${GetRestBaseUrl(siteUrl)}/web/siteGroups/getById(${groupId})/Users?$select=${userSelect}`;
    return url;
}

export async function GetGroup(siteUrl?: string, groupId?: number, options?: {
    expandUsers: boolean;
    refreshCache?: boolean;
}): Promise<IGroupInfo> {
    siteUrl = GetSiteUrl(siteUrl);

    return GetJson<IGroupInfo>(_getGroupRequestUrl(siteUrl, groupId), null,
        {
            ...shortLocalCache, jsonMetadata: jsonTypes.nometadata,
            allowCache: !options || options.refreshCache !== true
        })
        .then(async group => {
            if (group) {
                group.PrincipalType = PrincipalType.SharePointGroup;
                group.LoginName = group.Title;
                if (options && options.expandUsers && group.CanCurrentUserViewMembership) {
                    let users = await GetJson<{ value: IUserInfo[]; }>(_getGroupUsersRequestUrl(siteUrl, groupId), null, {
                        ...shortLocalCache, jsonMetadata: jsonTypes.nometadata,
                        allowCache: !options || options.refreshCache !== true
                    });
                    group.Users = users && users.value;
                }
            }
            return group;
        })
        .catch<IGroupInfo>(() => null);
}

export function GetGroupSync(siteUrl?: string, groupId?: number, options?: { expandUsers: boolean; }): IGroupInfo {
    siteUrl = GetSiteUrl(siteUrl);

    let res = GetJsonSync<IGroupInfo>(_getGroupRequestUrl(siteUrl, groupId), null,
        { ...shortLocalCache, jsonMetadata: jsonTypes.nometadata });
    if (res.success) {
        let group = res.result;
        if (group) {
            group.PrincipalType = PrincipalType.SharePointGroup;
            group.LoginName = group.Title;
            if (options && options.expandUsers && group.CanCurrentUserViewMembership) {
                let users = GetJsonSync<{ value: IUserInfo[]; }>(_getGroupUsersRequestUrl(siteUrl, groupId), null, { ...shortLocalCache, jsonMetadata: jsonTypes.nometadata });
                group.Users = users.success && users.result && users.result.value;
            }
        }
        return group;
    }
    else return null;
}

function _getGroupsRequestUrl(siteUrl: string) {
    siteUrl = GetSiteUrl(siteUrl);
    var url = `${GetRestBaseUrl(siteUrl)}/web/siteGroups?$select=${groupSelect}`;
    return url;
}

function _getGroupByNameRequestUrl(siteUrl: string, groupName: string) {
    var url = `${_getGroupsRequestUrl(siteUrl)}&$filter=LoginName eq '${encodeURIComponentEX(groupName, { singleQuoteMultiplier: 2 })}'`;
    return url;
}

export async function GetGroupByName(siteUrl: string, groupName: string, options?: {
    expandUsers: boolean;
    refreshCache?: boolean;
}): Promise<IGroupInfo> {
    siteUrl = GetSiteUrl(siteUrl);

    let res = await GetJson<{ d: { results: IGroupInfo[]; }; }>(_getGroupByNameRequestUrl(siteUrl, groupName), null,
        { ...shortLocalCache, allowCache: !options || options.refreshCache !== true });

    if (res) {
        let group = res && res.d && res.d.results && res.d.results[0];
        if (group) {
            group.PrincipalType = PrincipalType.SharePointGroup;
            group.LoginName = group.Title;
            if (options && options.expandUsers && group.CanCurrentUserViewMembership) {
                let users = GetJsonSync<{ value: IUserInfo[]; }>(_getGroupUsersRequestUrl(siteUrl, group.Id), null, {
                    ...shortLocalCache, jsonMetadata: jsonTypes.nometadata,
                    allowCache: !options || options.refreshCache !== true
                });
                group.Users = users.success && users.result && users.result.value;
            }
        }
        return group;
    }
    else return null;
}

export function GetGroupByNameSync(siteUrl: string, groupName: string, options?: { expandUsers: boolean; }): IGroupInfo {
    siteUrl = GetSiteUrl(siteUrl);

    let res = GetJsonSync<{ value: IGroupInfo[]; }>(_getGroupByNameRequestUrl(siteUrl, groupName), null,
        { ...shortLocalCache, jsonMetadata: jsonTypes.nometadata });
    if (res.success) {
        let group = res.result && res.result.value && res.result.value[0];
        if (group) {
            group.PrincipalType = PrincipalType.SharePointGroup;
            group.LoginName = group.Title;
            if (options && options.expandUsers && group.CanCurrentUserViewMembership) {
                let users = GetJsonSync<{ value: IUserInfo[]; }>(_getGroupUsersRequestUrl(siteUrl, group.Id), null, { ...shortLocalCache, jsonMetadata: jsonTypes.nometadata });
                group.Users = users.success && users.result && users.result.value;
            }
        }
        return group;
    }
    else return null;
}

export async function GetSiteGroups(siteUrl: string, refreshCache?: boolean) {
    siteUrl = GetSiteUrl(siteUrl);
    let res = await GetJson<{ d: { results: IGroupInfo[]; }; }>(_getGroupsRequestUrl(siteUrl), null,
        { ...shortLocalCache, allowCache: refreshCache !== true });

    if (res) {
        let groups = res && res.d && res.d.results || [];
        groups.forEach(g => {
            g.PrincipalType = PrincipalType.SharePointGroup;
            g.LoginName = g.Title;
        });
        return groups;
    }
    else return [];
}

export function GetInfoFromSPPeoplePickerControlFormEntity(entity: ISPPeoplePickerControlFormEntity): IUserInfo | IGroupInfo {
    if (IsSPPeoplePickerControlFormEntity(entity)) {
        var principalType = getPrincipalTypeFromPickerEntity(entity);
        if (isNullOrUndefined(principalType)) {
            let userValue = GetOrEnsureUserByLoginSync(null, entity.Key);
            if (userValue) {
                return userValue;
            }
            let groupValue = GetGroupByNameSync(null, entity.Key);
            if (groupValue) {
                return groupValue;
            }
        } else if (principalType === PrincipalType.SharePointGroup) {
            return GetGroupByNameSync(null, entity.Key);
        } else {
            return GetOrEnsureUserByLoginSync(null, entity.Key);
        }
    }
    return null;
}

interface ICreateSiteGroupResult {
    Id: number,
    IsHiddenInUI: boolean,//false,
    LoginName: string,
    Title: string,
    PrincipalType: PrincipalType.SharePointGroup,
    AllowMembersEditMembership: boolean,//false,
    AllowRequestToJoinLeave: boolean,//false,
    AutoAcceptRequestToJoinLeave: boolean,//false,
    Description: string,//"Admins can change site settings, permissions, perform updates, import and export",
    OnlyAllowMembersViewMembership: boolean,//true,
    OwnerTitle: string//"Shai Petel"
}
export async function CreateSiteGroup(siteUrl: string, info: { name: string, description: string }): Promise<ICreateSiteGroupResult> {
    let url = `${GetRestBaseUrl(siteUrl)}/web/siteGroups`;
    let createGroup = await GetJson<{ d: ICreateSiteGroupResult }>(url, jsonStringify({
        __metadata: {
            type: "SP.Group"
        },
        Title: info.name,
        Description: info.description
    }), { allowCache: false });
    return createGroup.d;
}
export async function AddUserToGroup(siteUrl: string, groupId: number, userIdOrLogin: number | string): Promise<void> {
    let url = `${GetRestBaseUrl(siteUrl)}/web/siteGroups(${groupId})/users`;
    if (isNumber(userIdOrLogin)) {
        let ensured = await GetUser(siteUrl, userIdOrLogin);
        userIdOrLogin = ensured.LoginName;
    }

    await GetJson(url, jsonStringify({
        LoginName: userIdOrLogin
    }), { allowCache: false, jsonMetadata: jsonTypes.nometadata });

}
export async function RemoveUserFromGroup(siteUrl: string, groupId: number, userId: number): Promise<void> {
    let url = `${GetRestBaseUrl(siteUrl)}/web/siteGroups(${groupId})/users/removeById(${userId})`;
    await GetJson(url, null, { method: "POST", allowCache: false, jsonMetadata: jsonTypes.nometadata });
}

export async function SetGroupOwner(siteUrl: string, groupId: number, ownerId: number, ownerIsAGroup?: boolean) {
    //https://github.com/SharePoint/sp-dev-docs/issues/5031#issuecomment-594710013
    //if owner is a group - rest API doens't work.
    if (ownerIsAGroup !== true) {
        let url = `${GetRestBaseUrl(siteUrl)}/web/siteGroups/getById('${groupId}')/SetUserAsOwner(${ownerId})`;
        try {
            await GetJson<{ 'odata.null': true }>(url, null, { jsonMetadata: jsonTypes.nometadata, method: "POST" });
            return true;
        } catch (e) {
            logger.error(`SetGroupOwner ${groupId} ${ownerId} error:`);
            logger.error(e);
            return false;
        }
    }
    else {
        try {
            let soapUrl = `${GetSiteUrl(siteUrl)}_vti_bin/client.svc/ProcessQuery`;
            let siteId = await GetSiteId(siteUrl);
            let serviceJSONResponse = await GetJson<{ ErrorInfo?: string }[]>(soapUrl, `<Request AddExpandoFieldTypeSuffix="true" SchemaVersion="15.0.0.0" LibraryVersion="15.0.0.0" ApplicationName=".NET Library" xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009">
<Actions>
  <SetProperty Id="1" ObjectPathId="2" Name="Owner">
    <Parameter ObjectPathId="3" />
  </SetProperty>
  <Method Name="Update" Id="4" ObjectPathId="2" />
</Actions>
<ObjectPaths>
  <Identity Id="2" Name="740c6a0b-85e2-48a0-a494-e0f1759d4aa7:site:${siteId}:g:${groupId}" />
  <Identity Id="3" Name="740c6a0b-85e2-48a0-a494-e0f1759d4aa7:site:${siteId}:g:${ownerId}" />
</ObjectPaths>
</Request>`, {
                headers: {
                    Accept: jsonTypes.standard,
                    "content-type": contentTypes.xml
                }
            });
            //logger.json(serviceJSONResponse, "soap result");
            return isNullOrEmptyArray(serviceJSONResponse) || isNullOrEmptyString(serviceJSONResponse[0].ErrorInfo);
        } catch (e) {
            logger.error(`SetGroupOwner via SOAP ${ownerId} ${ownerId} error:`);
            logger.error(e);
            return false;
        }
    }
}