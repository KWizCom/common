# KWIZ Common Repo

A collection of common helpers and utilities used across KWIZ projects

To get started, configure our modules to your project by calling config:

```
import { config } from "@kwiz/common";
export const { GetLogger } = config({
    BuildNumber: BuildNumber,
    //send true to have verbose logs and turn on debug mode
    IsLocalDev: IsLocalDev,
    ReleaseStatus: ReleaseStatus,
    //prefix logger with your project name
    ProjectName: "[cms]"
});
```
