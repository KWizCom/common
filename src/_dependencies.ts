export var BuildNumber = "unset";
export var IsLocalDev = false;
export var ReleaseStatus = "npm";
export function SetDependencies(params: {
    BuildNumber: string;
    IsLocalDev: boolean;
    ReleaseStatus: string;
}) {
    BuildNumber = params.BuildNumber;
    IsLocalDev = params.IsLocalDev;
    ReleaseStatus = params.ReleaseStatus;
}