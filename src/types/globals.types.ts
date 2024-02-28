import { IDictionary } from "./common.types";

declare global {
    interface IKWizComGlobals {
        globals?: IDictionary<any>;
    }
}