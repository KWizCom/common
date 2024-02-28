interface IMomentJSObj {
    toDate: () => Date;
    isValid: () => boolean;
}

declare function momentJS(inp?: string, format?: string, strict?: boolean): IMomentJSObj;
declare function monentJSTimeZone(inp?: string, format?: string, strict?: boolean): IMomentJSObj;