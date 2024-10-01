import { isBoolean, isString } from "./exports-index";

export var BuildNumber = "unset";
export var IsLocalDev = false;
export var ReleaseStatus = "npm";
export function SetDependencies(params: {
    BuildNumber?: string;
    IsLocalDev?: boolean;
    ReleaseStatus?: string;
}) {
    if (isString(params.BuildNumber)) BuildNumber = params.BuildNumber;
    if (isBoolean(params.IsLocalDev)) IsLocalDev = params.IsLocalDev;
    if (isString(params.ReleaseStatus)) ReleaseStatus = params.ReleaseStatus;
}