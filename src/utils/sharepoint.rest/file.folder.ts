import { IDictionary, IFileInfo, IFolderBasicInfo, IRequestBody, IRestOptions, IRestResponseType, encodeURIComponentEX, isNotEmptyArray, isNullOrEmptyString, isNullOrUndefined, isNumber, isNumeric, jsonStringify, jsonTypes, makeServerRelativeUrl, newGuid, normalizeUrl } from "../_dependencies";
import { ConsoleLogger } from "../consolelogger";
import { GetJson, GetJsonSync, longLocalCache, noLocalCache, shortLocalCache } from "../rest";
import { GetRestBaseUrl, GetSiteUrl } from "./common";
import { GetListRestUrl } from "./list";

const logger = ConsoleLogger.get("SharePoint.Rest.FileNFolder");

let existingFolders: string[] = [];

export async function EnsureFolderPath(siteUrl: string, folderServerRelativeUrl: string): Promise<boolean> {
    siteUrl = GetSiteUrl(siteUrl);

    //issue 7176
    folderServerRelativeUrl = makeServerRelativeUrl(folderServerRelativeUrl, siteUrl);
    if (existingFolders.indexOf(folderServerRelativeUrl) >= 0) {
        return true;
    }

    let url = `${GetRestBaseUrl(siteUrl)}/Web/getFolderByServerRelativeUrl(serverRelativeUrl='${folderServerRelativeUrl}')?$select=exists`;
    let folder = await GetJson<{ d: { Exists: boolean; }; }>(url);
    if (folder && folder.d.Exists) {
        existingFolders.push(folderServerRelativeUrl);
        return true;
    }
    else {
        let parts = folderServerRelativeUrl.split('/');
        if (parts.length > 1) {
            let parentFolder = parts.slice(0, parts.length - 1).join('/');

            //ensure parent
            let parent = await EnsureFolderPath(siteUrl, parentFolder);
            if (parent) {
                //create it
                let ensure = await EnsureFolder(siteUrl, parentFolder, parts[parts.length - 1]);
                if (ensure.Exists) {
                    existingFolders.push(folderServerRelativeUrl);
                    return true;
                }
            }
        }
    }
    return false;
}

export function EnsureFolder(siteUrl: string, parentFolderServerRelativeUrl: string, folderName: string): Promise<{ Exists: boolean; ServerRelativeUrl?: string; }> {
    siteUrl = GetSiteUrl(siteUrl);

    parentFolderServerRelativeUrl = makeServerRelativeUrl(parentFolderServerRelativeUrl, siteUrl);

    return GetJson<{ d: { Exists: boolean; ServerRelativeUrl: string; }; }>(`${GetRestBaseUrl(siteUrl)}/Web/getFolderByServerRelativeUrl(serverRelativeUrl='${parentFolderServerRelativeUrl}')/folders/add(url='${folderName}')`, null, { method: "POST", spWebUrl: siteUrl })
        .then(r => { return r.d; })
        .catch<{ Exists: boolean; ServerRelativeUrl?: string; }>(() => { return { Exists: false }; });
}


export function DeleteFolder(siteUrl: string, folderUrl: string): Promise<boolean> {
    siteUrl = GetSiteUrl(siteUrl);
    folderUrl = makeServerRelativeUrl(folderUrl, siteUrl);
    var requestUrl = `${GetRestBaseUrl(siteUrl)}/Web/getFolderByServerRelativeUrl(serverRelativeUrl='${folderUrl}')`;

    return GetJson(requestUrl, null, {
        method: "POST",
        xHttpMethod: "DELETE"
    })
        .then(r => true)
        .catch<boolean>((e) => false);
}

export function GetFolderFiles(siteUrl: string, folderUrl: string): Promise<IFileInfo[]> {
    siteUrl = GetSiteUrl(siteUrl);
    folderUrl = makeServerRelativeUrl(folderUrl, siteUrl);
    var requestUrl = `${GetRestBaseUrl(siteUrl)}/Web/getFolderByServerRelativeUrl(serverRelativeUrl='${folderUrl}')`
        + `/files?$select=Exists,Name,ServerRelativeUrl,Title,TimeCreated,TimeLastModified`;

    return GetJson<{ d: { results: IFileInfo[]; }; }>(requestUrl).then(r => {
        return r.d && r.d.results || [];
    }).catch<IFileInfo[]>(() => {
        return [];
    });
}

export function UploadFileSync(siteUrl: string, folderServerRelativeUrl: string, fileName: string, fileContent: IRequestBody): {
    Exists: boolean;
    ServerRelativeUrl?: string;
    ListItemAllFields?: { [fieldInternalName: string]: any; };
} {
    siteUrl = GetSiteUrl(siteUrl);

    folderServerRelativeUrl = makeServerRelativeUrl(folderServerRelativeUrl, siteUrl);

    let res = GetJsonSync<{ d: { Exists: boolean; ServerRelativeUrl: string; }; }>(
        `${GetRestBaseUrl(siteUrl)}/Web/getFolderByServerRelativeUrl(serverRelativeUrl='${folderServerRelativeUrl}')/files/add(url='${fileName}',overwrite=true)?$expand=ListItemAllFields`,
        fileContent, {
        method: 'POST',
        spWebUrl: siteUrl
    });

    return res.success && res.result && res.result.d ? res.result.d : { Exists: false };
}

export function UploadFile(siteUrl: string, folderServerRelativeUrl: string, fileName: string, fileContent: IRequestBody, options?: { overwrite?: boolean; }): Promise<{
    Exists: boolean;
    ServerRelativeUrl?: string;
    [fieldInternalName: string]: any;
}> {
    siteUrl = GetSiteUrl(siteUrl);

    options = options || { overwrite: true };

    folderServerRelativeUrl = makeServerRelativeUrl(folderServerRelativeUrl, siteUrl);

    return GetJson<{ d: { Exists: boolean; ServerRelativeUrl: string; }; }>(
        `${GetRestBaseUrl(siteUrl)}/Web/getFolderByServerRelativeUrl(serverRelativeUrl='${folderServerRelativeUrl}')/files/add(url='${fileName}'${options.overwrite ? ',overwrite=true' : ''})?$expand=ListItemAllFields`,
        fileContent, {
        method: 'POST',
        spWebUrl: siteUrl,
        allowCache: false,
        postCacheKey: null
    })//Issue 6657 force set "POST" since we might send empty string as the value
        .then(r => { return r.d; })
        .catch<{
            Exists: boolean;
            ServerRelativeUrl?: string;
            [fieldInternalName: string]: any;
        }>(() => { return { Exists: false }; });
}

export function RecycleFile(siteUrl: string, fileServerRelativeUrl: string): Promise<boolean> {
    siteUrl = GetSiteUrl(siteUrl);

    let fileRestUrl = GetFileRestUrl(siteUrl, fileServerRelativeUrl) + "/recycle()";

    return GetJson(fileRestUrl, null, {
        method: "POST",
        headers: {
            "IF-MATCH": "*"
        }
    })
        .then(r => true)
        .catch<boolean>((e) => false);
}

export function DeleteFile(siteUrl: string, fileServerRelativeUrl: string): Promise<boolean> {
    siteUrl = GetSiteUrl(siteUrl);

    let fileRestUrl = GetFileRestUrl(siteUrl, fileServerRelativeUrl);

    return GetJson(fileRestUrl, null, {
        method: "POST",
        xHttpMethod: "DELETE"
    })
        .then(r => true)
        .catch<boolean>((e) => false);
}

/** get the REST url for the site/_api/web/getfile....() */
function GetFileRestUrl(siteUrl: string, fileServerRelativeUrl: string) {
    fileServerRelativeUrl = makeServerRelativeUrl(fileServerRelativeUrl, siteUrl);
    let fileRestUrl = `${GetRestBaseUrl(siteUrl)}/Web/getFileByServerRelativeUrl('${fileServerRelativeUrl}')`;
    return fileRestUrl;
}

export function GetFileSync<T>(siteUrl: string, fileServerRelativeUrl: string, responseType?: IRestResponseType, options?: {
    /** default, short cache. */
    cache?: "long" | "short" | "nocache";
}): { Exists: boolean; Content?: T; } {
    siteUrl = GetSiteUrl(siteUrl);

    let restOptions: IRestOptions = isNullOrUndefined(options) || options.cache !== "long"
        ? { ...shortLocalCache }
        : { ...longLocalCache };

    if (options && options.cache === "nocache")
        restOptions.forceCacheUpdate = true;

    if (!isNullOrUndefined(responseType)) {
        restOptions.responseType = responseType;
    }

    let fileRestUrl = GetFileRestUrl(siteUrl, fileServerRelativeUrl);
    if (!restOptions.forceCacheUpdate && reloadCacheFileModifiedRecently(siteUrl, fileServerRelativeUrl)) {
        restOptions.forceCacheUpdate = true;
    }

    let response = GetJsonSync<T>(`${fileRestUrl}/$value`, null, restOptions);
    if (response && response.success)
        return {
            Exists: true,
            Content: response.result
        };
    else
        return {
            Exists: false
        };
}
export function GetFile<T>(siteUrl: string, fileServerRelativeUrl: string, allowCache?: boolean, responseType?: IRestResponseType): Promise<{ Exists: boolean; Content?: T; }> {
    siteUrl = GetSiteUrl(siteUrl);

    let options: IRestOptions = { ...(allowCache === true ? shortLocalCache : noLocalCache), forceCacheUpdate: allowCache !== true };
    if (!isNullOrUndefined(responseType)) {
        options.responseType = responseType;
    }

    let fileRestUrl = GetFileRestUrl(siteUrl, fileServerRelativeUrl);
    if (!options.forceCacheUpdate && reloadCacheFileModifiedRecently(siteUrl, fileServerRelativeUrl)) {
        options.forceCacheUpdate = true;
    }

    return GetJson<T>(`${fileRestUrl}/$value`, null, options).then(r => {
        return {
            Exists: true,
            Content: r
        };
    }).catch<{ Exists: boolean; Content?: T; }>(() => {
        return {
            Exists: false
        };
    });
}

var $reloadCacheFileModifiedRecentlyFlagged: string[] = [];
function reloadCacheFileModifiedRecently(siteUrl: string, fileServerRelativeUrl: string) {
    let fileRestUrl = GetFileRestUrl(siteUrl, fileServerRelativeUrl);
    let key = fileRestUrl.toLowerCase();

    //only flag it once, first time it is requested...
    if (!$reloadCacheFileModifiedRecentlyFlagged.includes(key)) {
        try {
            $reloadCacheFileModifiedRecentlyFlagged.push(key);

            let fileInfo = GetJsonSync<{ d: { TimeLastModified: string; }; }>(`${fileRestUrl}?$select=TimeLastModified`,
                null, { allowCache: true });//only allow in-memory cache for this
            if (fileInfo.success && fileInfo.result) {
                let modified = new Date(fileInfo.result.d.TimeLastModified);
                let now = new Date();
                let difference = now.getTime() - modified.getTime();
                if (difference < 5 * 60 * 1000) {
                    //file has changed in the past 5 minutes - do not allow cache on it.
                    //happens when user uses classic app to change settings, the clear cache does not clear it on the main
                    //site URL ( support case - Issue 778 780 & 782 )
                    return true;
                }
            }
        } catch (e) { }
    }

    return false;
}

/** Get file size (bytes) by file server relative url - can also get this by selecting FileSizeDisplay field on the item */
export async function GetFileSize(siteUrl: string, fileServerRelativeUrl: string, allowCache?: boolean);
/** Get file size (bytes) by list item - can also get this by selecting FileSizeDisplay field on the item */
export async function GetFileSize(siteUrl: string, listId: string, itemId: number, allowCache?: boolean);
export async function GetFileSize(siteUrl: string, fileServerRelativeUrlOrListId: string, itemIdOrAllowCache?: number | boolean, allowCache?: boolean): Promise<number> {
    siteUrl = GetSiteUrl(siteUrl);

    let requestUrl = "";
    if (isNumber(itemIdOrAllowCache) || isNumeric(itemIdOrAllowCache)) {
        requestUrl = GetListRestUrl(siteUrl, fileServerRelativeUrlOrListId) + `/items(${itemIdOrAllowCache})/File`;
    }
    else {
        allowCache = itemIdOrAllowCache === true;
        requestUrl = GetFileRestUrl(siteUrl, fileServerRelativeUrlOrListId);
    }
    let options: IRestOptions = { allowCache: allowCache === true, jsonMetadata: jsonTypes.nometadata };

    try {
        let result = await GetJson<{ vti_x005f_filesize: number; }>(`${requestUrl}/Properties?$select=vti_x005f_filesize`, null, options);
        return result.vti_x005f_filesize;
    } catch (e) {
        return null;
    }
}

export async function GetListFolders(siteUrl: string, listIdOrTitle: string): Promise<IFolderBasicInfo[]> {
    siteUrl = GetSiteUrl(siteUrl);

    //switched to get request with no meta data - much faster.
    let url = GetListRestUrl(siteUrl, listIdOrTitle) + `/items?$Select=Folder/ServerRelativeUrl,Folder/Name&$filter=FSObjType eq 1&$expand=Folder`;

    let results: IFolderBasicInfo[] = [];
    try {
        let requestResult = (await GetJson<{
            value: { Folder: IFolderBasicInfo; }[];
        }>(url, null, { allowCache: true, jsonMetadata: jsonTypes.nometadata }));

        if (isNotEmptyArray(requestResult && requestResult.value)) {
            results = requestResult.value.map(f => ({
                Name: f.Folder.Name,
                ServerRelativeUrl: normalizeUrl(f.Folder.ServerRelativeUrl)
            }));
        }
    } catch (e) {
        //Issue 7543 throttled library with lots of items will fail so return empty array
        logger.error(`Could not get folders from ${listIdOrTitle}, check network for more infromation.`);
    }

    return results;
}

export async function GetFileItemId(siteUrl: string, fileServerRelativeUrl: string) {
    siteUrl = GetSiteUrl(siteUrl);
    const restUrl = `${GetRestBaseUrl(siteUrl)}/web/getFileByServerRelativeUrl('${encodeURIComponentEX(fileServerRelativeUrl)}')/ListItemAllFields/id`;
    const result = await GetJson<{ value: number; }>(restUrl, null, { jsonMetadata: jsonTypes.nometadata });
    return result.value;
}
interface iWebPartPageProps {
    /** webpart id */
    id: string;
    /** unique instance id - random guid, or blank to auto-generate */
    instanceId?: string;
    title: string;
    description: string;
    dataVersion?: "1.0";
    properties: IDictionary<string | boolean>
}
interface iWebPartPageResult {
    /** site relative random page name, such as: "SitePages/y2k9xm8v.aspx" */
    value: string;
}
/** Creates a modern single app page and return its URL. if a file in that name exists, it will return one with (1) appended to it. */
export async function CreateAppPage(siteUrl: string, info: {
    /** file name, without extension */
    name: string; webPartDataAsJson: iWebPartPageProps
}) {
    //read more: 
    //https://petelus.sharepoint.com/sites/CMSTest/_api/SitePages/Pages/CreateAppPage
    //https://spblog.net/post/2019/03/05/what-s-new-and-what-s-changed-in-sharepoint-online-rest-api-in-january-february-2019

    function getFileServerRelativeUrl(siteRelative: string) {
        const fileRelativeUrl = makeServerRelativeUrl(`${siteUrl}${siteRelative}`);
        return fileRelativeUrl;
    }

    let webPartDataAsJson = info.webPartDataAsJson;
    if (isNullOrEmptyString(webPartDataAsJson.instanceId))
        webPartDataAsJson.instanceId = newGuid();
    if (isNullOrEmptyString(webPartDataAsJson.dataVersion))
        webPartDataAsJson.dataVersion = "1.0";

    return logger.groupAsync("CreateAppPage", async log => {
        siteUrl = GetSiteUrl(siteUrl);
        const restUrl = `${GetRestBaseUrl(siteUrl)}/SitePages/Pages/CreateAppPage`;
        const result = await GetJson<iWebPartPageResult>(restUrl, jsonStringify({
            webPartDataAsJson: jsonStringify(webPartDataAsJson)
        }), { method: 'POST', jsonMetadata: jsonTypes.nometadata });
        log(`created page`);
        log(jsonStringify(result));

        let fileRelativeUrl = getFileServerRelativeUrl(result.value);

        const fileId = await GetFileItemId(siteUrl, fileRelativeUrl);
        const updateRestUrl = `${GetRestBaseUrl(siteUrl)}/SitePages/Pages/UpdateAppPage`;
        const updateResult = await GetJson<iWebPartPageResult>(updateRestUrl, jsonStringify({
            pageId: fileId,
            title: info.name,
            webPartDataAsJson: jsonStringify(webPartDataAsJson)
        }), { method: 'POST', jsonMetadata: jsonTypes.nometadata });

        log(`updated page`);
        log(jsonStringify(updateResult));

        fileRelativeUrl = getFileServerRelativeUrl(updateResult.value);

        return fileRelativeUrl;
    });
}

/** Move a file to a new name/url, this API allows for changing file extension as well */
export async function MoveFile(siteUrl: string, currentServerRelativeUrl: string, targetServerRelativeUrl: string) {
    try {
        let url = `${GetRestBaseUrl(siteUrl)}/web/getfilebyserverrelativeurl('${currentServerRelativeUrl}')/moveto(newurl='${targetServerRelativeUrl}',flags=1)`;
        let result = await GetJson(url, undefined, { method: "POST", jsonMetadata: jsonTypes.nometadata });
        logger.json(result, "move file");
        return true;
    } catch (e) {
        logger.json(e, "move file");
        return false;
    }
    //this does NOT allow to change the file extension. only file name.
    // return UpdateItem(siteUrl, listIdOrTitle, itemId, {
    //     FileLeafRef: newFileName "hello.txt" >> "hello.md" won't work.
    // });
}
