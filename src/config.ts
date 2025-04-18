import { SetDependencies } from './_dependencies';
import { ConsoleLogger } from './utils/consolelogger';

export function config(params: {
    BuildNumber?: string;
    IsLocalDev?: boolean;
    ReleaseStatus?: string;
    ProjectName?: string;
}) {
    SetDependencies(params);
    function GetLogger(name: string) {
        return ConsoleLogger.get(name, params.ProjectName);
    }
    return {
        GetLogger,
        /** @deprecated exported as GetLogger, which is how is used anyways  */
        logger: GetLogger
    }
}
