import { IDictionary } from "./_dependencies";
import { hasOwnProperty } from "./objects";
import { isFunction, isNullOrUndefined, isNumeric } from "./typecheckers";

var promises: IDictionary<Promise<any>> = {};
/** key has to be unique for the promise name + its parameters
 * Usage: export var initTests = promiseOnce("initTests", async () => { ... });
 * Usage with variables:
 * function DiscoverTenantInfo(hostName: string) {
 *    return promiseOnce(`DiscoverTenantInfo|${hostName}`, async () => {...});
 * }
 */
export async function promiseOnce<T>(key: string, promise: () => Promise<T>, isValidResult?: (result: T) => Promise<boolean>): Promise<T> {
    if (hasOwnProperty(promises, key) && isFunction(isValidResult)) {
        //we have en existing pending promise...
        let queuedResult: T = null;
        try { queuedResult = await promises[key]; } catch (e) { }
        if ((await isValidResult(queuedResult)) !== true)
            delete promises[key];
    }


    if (!hasOwnProperty(promises, key)) {
        promises[key] = promise();
    }
    return promises[key];
}

export function promiseAllSequential<T = any>(asyncFuncs: (() => Promise<T>)[]): Promise<T[]> {
    if (!Array.isArray(asyncFuncs) || !asyncFuncs.length) {
        return Promise.resolve([]);
    }
    return asyncFuncs.reduce((promiseChain, currentTaskcurrentTask) => (
        promiseChain.then((result) => {
            let taskResult = currentTaskcurrentTask();
            if (isNullOrUndefined(taskResult) || !isFunction(taskResult.then))//culprit - found one that did not return a promise?! make one.
                taskResult = Promise.resolve() as any as Promise<T>;

            return taskResult.then(Array.prototype.concat.bind(result));
        })
    ), Promise.resolve([]));
}

export function promiseNParallel<T>(asyncFuncs: (() => Promise<T>)[], maxParallel?: number): Promise<T[]> {
    if (!Array.isArray(asyncFuncs) || !asyncFuncs.length) {
        return Promise.resolve([]);
    }
    if (!isNumeric(maxParallel)) {
        maxParallel = asyncFuncs.length;
    }

    var startChain = () => {
        var chainData = [];

        if (asyncFuncs.length) {
            let next = (data: T) => {
                chainData.push(data);
                return asyncFuncs.length ? (asyncFuncs.shift())().then(next) : chainData;
            };
            return (asyncFuncs.shift())().then(next);
        } else {
            return Promise.resolve(chainData);
        }
    };

    var chains = [];
    for (var k = 0; k < maxParallel; k += 1) {
        chains.push(startChain());
    }

    return Promise.all(chains).then(d => {
        //flatten results
        return d.reduce((acc, val) => acc.concat(val), []);
    });
}

/** provides an asnyc sleep function that allows you to delay async/wait calls  */
export function sleepAsync(seconds?: number): Promise<void> {
    return new Promise(resolve => {
        window.setTimeout(() => resolve(), seconds > 0 ? seconds * 1000 : 3000);
    });
}

/** provides the ability to retry an async function n times with a optional delay between calls */
export async function retryAsync<T>(fn: (...args) => Promise<T>, numberOfRetries: number, seconds = 1) {
    let error: Error = null;

    for (let i = 0; i < numberOfRetries; i++) {
        try {
            error = null;
            await sleepAsync(i === 0 ? 0 : seconds);
            return await fn();
        } catch (ex) {
            error = ex;
        }
    }

    if (error) {
        throw error;
    }
    throw new Error(`Failed retrying ${numberOfRetries} times`);
}