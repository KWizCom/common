interface IMomentJSObj {
    toDate: () => Date;
    isValid: () => boolean;
}


export type typeMomentJS = (inp?: string, format?: string, strict?: boolean) => IMomentJSObj;
export type typeMonentJSTimeZone = (inp?: string, format?: string, strict?: boolean) => IMomentJSObj;
declare global {
    var momentJS: typeMomentJS;
    var monentJSTimeZone: typeMonentJSTimeZone;
}