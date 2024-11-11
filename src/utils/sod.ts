import { isDebug } from "../helpers/debug";
import { getFromFullName, isFunction, isNullOrEmptyString, isNullOrUndefined, isString, isTypeofFullNameNullOrUndefined, typeofFullName } from "../helpers/typecheckers";
import { ksGlobal } from "../types/knownscript.types";

declare global {
    interface Window {
        g_kwizcom_sods: { [sodName: string]: Sod; };
    }
}

interface ISodCallback {
    called: boolean;
    callback: () => void;
}

// eslint-disable-next-line no-shadow
enum SodState {
    pending = "pending",
    done = "done"
}

export default class Sod {
    private sodName: string;
    private url: string;
    private script: HTMLScriptElement;
    private state: string;
    private notified: boolean;
    private callbacks: ISodCallback[];

    public constructor(url: string, sodName: string) {
        this.url = url;
        this.sodName = sodName;
        this.state = SodState.pending;
        this.notified = false;
        this.callbacks = [];
        this.script = null;
    }

    private error() {
        if (isDebug()) console.log('unhandled error in sod');
    }

    private loadScript(scriptUrl: string, sync = false) {
        let self = this;
        var successCallback = () => {
            self.load();
        };
        var errorCallback = () => {
            self.error();
        };
        self.script = Sod.loadScript(scriptUrl, successCallback, errorCallback, sync);
        self.state = SodState.pending;
    }

    private load() {
        let self = this;
        self.state = SodState.done;
        if (!self.notified) {
            self.notify();
        }
    }

    private notify() {
        let self = this;
        var callbackLength = self.callbacks.length;
        for (var i = 0; i < callbackLength; i++) {
            var sodCallback = self.callbacks[i];
            if (!sodCallback.called && typeof (sodCallback.callback) === "function") {
                try {
                    sodCallback.callback();
                    sodCallback.called = true;
                } catch (ex) {
                    if (isDebug()) console.log('unhandled error in sod');
                }
            }
        }
        self.notified = true;
    }

    private reset() {
        let self = this;
        var callbackLength = self.callbacks.length;
        for (var i = 0; i < callbackLength; i++) {
            this.callbacks[i].called = false;
        }
        self.notified = false;
    }

    private static loadScript(url: string, successCallback: () => void, errCallback: () => void, sync = false) {
        let scriptElm = document.createElement("script");
        if (sync === true) {
            let req = new XMLHttpRequest();
            req.open("GET", url, false);
            req.send();
            scriptElm.appendChild(document.createTextNode(req.responseText));
            successCallback();
        }
        else {
            let agt = navigator.userAgent.toLowerCase();
            let ie8down = agt.indexOf("msie") !== -1 && parseInt(agt.substring(agt.indexOf("msie ") + 5), 10) <= 8;

            let getCallback = (cb: () => void) => {
                return () => {
                    var loaded = false;

                    if (ie8down && typeof (scriptElm as any).readyState !== "undefined") {
                        loaded = (scriptElm as any).readyState === "complete" || (scriptElm as any).readyState === "loaded";
                    } else {
                        loaded = true;
                    }

                    if (loaded) {
                        (scriptElm as any).onreadystatechange = null;
                        scriptElm.onload = null;
                        scriptElm.onerror = null;
                        cb();
                    }
                };
            };

            scriptElm.type = "text/javascript";
            scriptElm.src = url;
            if (ie8down) {
                (scriptElm as any).onreadystatechange = getCallback(successCallback);
            } else {
                scriptElm.onload = getCallback(successCallback);
                scriptElm.onerror = getCallback(errCallback);
            }
        }
        (document.head || document.getElementsByTagName("HEAD")[0]).appendChild(scriptElm);
        return scriptElm;
    }

    public static getGlobal(global: ksGlobal) {
        if (isString(global))
            return getFromFullName(global);
        else
            return global.getter();
    }

    public static ensureScriptNoPromise(scriptUrl: string, global: ksGlobal, callback?: () => void, sodName?: string, sync = false) {
        if (!isNullOrEmptyString(global) && typeofFullName(Sod.getGlobal(global)) !== "undefined") {
            //this global object already exists, no need to reload this script.
            if (isFunction(callback)) {
                callback();
            }
        }
        else {
            sodName = (isNullOrEmptyString(sodName) === false && sodName || scriptUrl).toLowerCase();
            var sod = Sod._getGlobalSod(sodName);

            if (!sod) {
                sod = Sod._addGlobalSod(sodName, scriptUrl);
            }

            if (!isNullOrUndefined(callback)) {
                sod.callbacks.push({ "called": false, "callback": callback });
            }

            if (!sod.script) {
                sod.loadScript(scriptUrl, sync);
            } else if (sod.state === SodState.done || sod.notified) {
                sod.notify();
            }
        }
    }

    public static async ensureScript(scriptUrl: string, global: ksGlobal, callback?: () => void, sodName?: string, sync = false): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let resolveCallback = () => {
                if (!isNullOrUndefined(callback)) callback();
                resolve();
            };
            Sod.ensureScriptNoPromise(scriptUrl, global, resolveCallback, sodName, sync);
        });
    }

    private static _initGlobalSods() {
        //static must be globally shared between all instances...
        if (isTypeofFullNameNullOrUndefined("g_kwizcom_sods")) {
            window.g_kwizcom_sods = {};
        }
    }

    private static _getGlobalSod(name: string) {
        Sod._initGlobalSods();
        return window.g_kwizcom_sods[name];
    }

    private static _addGlobalSod(name: string, scriptUrl: string) {
        Sod._initGlobalSods();
        window.g_kwizcom_sods[name] = new Sod(scriptUrl, name);
        return window.g_kwizcom_sods[name];
    }
}