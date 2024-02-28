import { blobToBase64, isNullOrEmptyString } from "./_dependencies";
import { GetJson } from "./rest";
import { GetFile } from "./sharepoint.rest/file.folder";

/** if the file is in SharePoint, provide a siteRelativeUrl so that we can get the file value via REST api to avoid CORS error when accessing a file on the site from within the app web */
export async function imageToBase64(imageSrc: string, siteRelativeUrl?: string): Promise<string> {
    try {
        let fileBlob: Blob = null;
        if (!isNullOrEmptyString(siteRelativeUrl) && imageSrc.toLowerCase().indexOf(siteRelativeUrl.toLowerCase()) >= 0) {
            let spFile = await GetFile<Blob>(siteRelativeUrl, imageSrc, true, "blob");
            if (spFile && spFile.Exists)
                fileBlob = spFile.Content;
        }

        //try simple rest if the first option failed
        if (fileBlob === null) {
            fileBlob = await GetJson<Blob>(imageSrc, null, { responseType: "blob", allowCache: true });
        }

        if (fileBlob) {
            let base64 = await blobToBase64(fileBlob);
            return base64;
        }
    } catch (e) {
    }
    return null;
}