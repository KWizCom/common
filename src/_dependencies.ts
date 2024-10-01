
export var BuildNumber = "unset";
export var IsLocalDev = false;
export var ReleaseStatus = "npm";
export function SetDependencies(params: {
    BuildNumber?: string;
    IsLocalDev?: boolean;
    ReleaseStatus?: string;
}) {
    if (typeof params.BuildNumber === "string") BuildNumber = params.BuildNumber;
    if (typeof params.IsLocalDev === "boolean") IsLocalDev = params.IsLocalDev;
    if (typeof params.ReleaseStatus === "string") ReleaseStatus = params.ReleaseStatus;
}