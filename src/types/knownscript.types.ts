export type ksGlobal = string | { name: string; getter: (() => any); };
export interface IKnownScript {
    /** cdn url for this script */
    url: string;
    /** specify any other libraries this script is depended on. These libraries will be loaded before this script if they were not loaded already. */
    dependencies?: IKnownScript[];
    /** specify global object name, if available. if this object exists - the script will not load, assuming it was already loaded
     * Alternativly, provide a getter if it is more complex
     */
    global: ksGlobal;
    /** specify sod script name. if provided, and the sod in this name was already loaded - this script will not be loaded again. */
    sodName?: string;
    /** If this library requires a CSS file, add it here */
    css?: string[];
    /** If this library requires an RTL CSS file, add it here */
    rtlCss?: string[];
    /** set to true, to make sure known script will not try to load the non min version on debug */
    forceMin?: boolean;
}