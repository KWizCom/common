import { IDictionary } from "./_dependencies";
import { getGlobal, hasOwnProperty } from "./objects";
import { isFunction, isNullOrUndefined, isNumber } from "./typecheckers";

let _global = getGlobal<{ promises: IDictionary<Promise<any>> }>("helpers_promises",
    {
        promises: {}
    });

/**
 * Lock all concurrent calls to a resource to one promise for a set duration of time.
 * @param {string} key - Unique key to identify the promise.
 * @param {() => Promise<T>} promiseFunc - Function that will return the promise to be run only once.
 * @param {number} duration - Duration to hold on to the promise result. (default=1)
 * @returns {Promise<T>} Returns the single promise that will be fullfilled for all promises with the same key.
 * @example
 * // returns Promise<string>
 * var initTests = await promiseLock<string>("initTests", async () => { ... }, 2); 
 */
export async function promiseLock<T>(key: string, promiseFunc: () => Promise<T>, duration = 1): Promise<T> {
    return promiseOnce(key, promiseFunc).then((result) => {
        (globalThis || window).setTimeout(() => {
            _deletePromiseByKey(key);
        }, isNumber(duration) && duration >= 1 ? duration : 1);
        return result;
    });
}
/**
 * Ensures that a promise runs only once
 * @param {string} key - Unique key to identify the promise.
 * @param {() => Promise<T>} promiseFunc - Function that will return the promise to be run only once.
 * @param {(result: T) => Promise<boolean>} isValidResult - Optional function that returns boolean to indicate if the result returned
 * by the promise is valid and should be kepy in memory. 
 * @returns {Promise<T>} Returns the single promise that will be fullfilled for all promises with the same key.
 * @example
 * // returns Promise<string>
 * var initTests = await promiseOnce<string>("initTests", async () => { ... }); 
 */
export async function promiseOnce<T>(key: string, promiseFunc: () => Promise<T>, isValidResult?: (result: T) => Promise<boolean>): Promise<T> {
    let promises = _global.promises;

    if (hasOwnProperty(promises, key) && isFunction(isValidResult)) {
        //we have en existing pending promise...
        let queuedResult: T = null;
        try { queuedResult = await promises[key]; } catch (e) { }
        if ((await isValidResult(queuedResult)) !== true) {
            _deletePromiseByKey(key);
        }
    }

    if (!hasOwnProperty(promises, key)) {
        promises[key] = promiseFunc();
    }

    return promises[key];
}

/**
 * Runs all promises in sequential order.
 * @param {(() => Promise<T>)[]} asyncFuncs - Array of functions that return the promises to fullfill. 
 * @returns {Promise<T[]>} Returns a single promise with a merged array of results that are in the same order as the 
 * provided promise functions
 */
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

/**
 * Runs N promises in parallel.
 * @param {(() => Promise<T>)[]} asyncFuncs - Array of functions that return the promises to fullfill.
 * @param {number} [maxParallel] - Max number of promises to run in parallel (default=8).
 * @returns {Promise<T[]>} Returns a single promise with a merged array of results that are in the same order as the 
 * provided promise functions
 */
export function promiseNParallel<T>(asyncFuncs: (() => Promise<T>)[], maxParallel: number = 8): Promise<T[]> {
    if (!Array.isArray(asyncFuncs) || !asyncFuncs.length) {
        return Promise.resolve([]);
    }

    let startChain = () => {
        let chainData = [];

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

    let chains = [];
    for (let k = 0; k < maxParallel; k += 1) {
        chains.push(startChain());
    }

    return Promise.all(chains).then(d => {
        //flatten results
        return d.reduce((acc, val) => acc.concat(val), []);
    });
}

/**
 * Provides an asnyc sleep function that allows you to delay async/wait calls.
 * @param {number} [seconds] - Time to sleep in seconds. 
 */
export function sleepAsync(seconds?: number): Promise<void> {
    return new Promise(resolve => {
        (globalThis || window).setTimeout(() => resolve(), seconds > 0 ? seconds * 1000 : 3000);
    });
}

/**
 * Provides the ability to retry an async function n times with a optional delay between calls
 * @param {(...args) => Promise<T>} fn - Function to retry,
 * @param {number} numberOfRetries - Number of times to retry.
 * @param {number} [seconds] - Delay between retries in seconds (default=1).
 */
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

function _deletePromiseByKey(key: string) {
    let promises = _global.promises;
    if (hasOwnProperty(promises, key)) {
        try {
            delete promises[key];
            return true;
        } catch {
            return false;
        }
    }
}