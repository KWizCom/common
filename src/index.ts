import { ConsoleLogger } from './utils';
export * from './helpers';
export * from './types';
export * from './utils';

export var BuildNumber = "unset";
export var IsLocalDev = false;
export var ReleaseStatus = "npm";
export function config(params: {
    BuildNumber: string;
    IsLocalDev: boolean;
    ReleaseStatus: string;
    ProjectName: string;
}) {
    BuildNumber = params.BuildNumber;
    IsLocalDev = params.IsLocalDev;
    ReleaseStatus = params.ReleaseStatus;
    function GetLogger(name: string) {
        return ConsoleLogger.get(name, "[cms]");
    }
    return {
        logger: GetLogger
    }
}
