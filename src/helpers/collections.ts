import { IDictionary } from "./_dependencies";
import { IMultiLevelGroup, IMultiLevelGroupItem } from "./collections.base";
import { hasOwnProperty, objectsEqual } from "./objects";
import { isFunction, isNotEmptyArray, isNullOrEmptyArray, isNullOrEmptyString, isNullOrUndefined, isNumber, isString } from "./typecheckers";

/** check that every element in the arrays are the same value */
export function arraysEqual(arr1: any[], arr2: any[]): boolean {
    if (isNullOrEmptyArray(arr1) && isNullOrEmptyArray(arr2)) return true;
    return Array.isArray(arr1) && Array.isArray(arr2) && arr1.length === arr2.length && arr1.every((v1: any, i: number) => {
        var v2 = arr2[i];
        if (isString(v1) || isNumber(v1)) {
            return v1 === v2;
        } else if (Array.isArray(v1) && Array.isArray(v2)) {
            return arraysEqual(v1, v2);
        } else {
            return objectsEqual(v1, v2);
        }
    });
}

/** Takes an array and transforms it into a dictionary. this will assign all items of the same key as an array. */
export function groupBy<T>(arr: T[], getKeys: (element: T) => string[], filter?: (element: T) => boolean): IDictionary<T[]> {
    let dic: IDictionary<T[]> = {};

    if (isNotEmptyArray(arr))
        arr.forEach(i => {
            if (!isFunction(filter) || filter(i)) {
                let keys = getKeys(i);
                keys.forEach(key => {
                    if (isNullOrEmptyString(key)) key = "";
                    if (!hasOwnProperty(dic, key)) dic[key] = [i];
                    else dic[key].push(i);
                });
            }
        });
    return dic;
}

var groupByMultipleCacheKey = "$groupByMultipleCache";
/** allows nested multi-level grouping */
export function GroupByMultiple<ItemType>(arr: ItemType[], groupDefinitions: {
    /** return all groups this item belongs to */
    getGroupsForThisElement: ((element: ItemType) => string[]);
    /** Optional, add a prefix to the group. For example: "Priority > " to fullTitle will be "Priority > High" */
    groupPrefix?: string;
}[], options?: {
    filter?: (element: ItemType) => boolean;
    /** if groups were calculated, they are returned from cache. send true to clear that cache. send true if you suspect getKeysCollection might change on your existing array. */
    clearCache?: boolean;
    parentGroup?: IMultiLevelGroup<ItemType>;
}): IDictionary<IMultiLevelGroup<ItemType>> {
    options = options || {};
    if (options.clearCache || isNullOrUndefined(arr[groupByMultipleCacheKey])) {
        let dic: IDictionary<IMultiLevelGroup<ItemType>> = {};

        let groupDefinition = groupDefinitions[0];//get first
        let getKeys = groupDefinition.getGroupsForThisElement;

        if (isNotEmptyArray(arr)) {
            let groupIndex = 0;
            arr.forEach(i => {
                if (!isFunction(options.filter) || options.filter(i)) {
                    let keys = getKeys(i);
                    keys.forEach(key => {
                        if (isNullOrEmptyString(key)) key = "";
                        if (!hasOwnProperty(dic, key)) {
                            let groupKey = groupIndex.toString(10);
                            let groupKeyParent = options.parentGroup;
                            while (groupKeyParent) {
                                groupKey = groupKeyParent.index + "_" + groupKey;
                                groupKeyParent = groupKeyParent.parentGroup;
                            }
                            dic[key] = {
                                groupItems: [],
                                subGroups: {},
                                depth: options.parentGroup ? options.parentGroup.depth + 1 : 0,
                                parentGroup: options.parentGroup,
                                key: groupKey,
                                index: groupIndex,
                                title: key,
                                groupPrefix: groupDefinition.groupPrefix,
                                fullTitle: `${isNullOrEmptyString(groupDefinition.groupPrefix) ? "" : groupDefinition.groupPrefix}${key}`
                            };
                            groupIndex++;
                        }
                        let itemWithGroup = i as (ItemType & IMultiLevelGroupItem<ItemType>);
                        itemWithGroup.parentGroup = dic[key];
                        dic[key].groupItems.push(itemWithGroup);
                    });
                }
            });
        }

        if (isNotEmptyArray(groupDefinitions) && groupDefinitions.length > 1) {
            //run for every group and call this again
            Object.keys(dic).forEach(groupName => {
                let currentGroup = dic[groupName];
                currentGroup.subGroups = GroupByMultiple(currentGroup.groupItems, groupDefinitions.slice(1), {
                    ...options,
                    parentGroup: currentGroup
                });
            });
        }

        arr[groupByMultipleCacheKey] = dic;
    }
    return arr[groupByMultipleCacheKey];
}