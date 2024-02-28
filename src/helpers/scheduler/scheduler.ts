import { firstOrNull, sortNumberArrayAsc } from "../collections.base";
import { cloneDate } from "../date";
import { padLeft } from "../strings";
import { isNotEmptyArray, isNullOrUndefined } from "../typecheckers";

export type hourlyInterval = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type hours = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;
export type days = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export enum ScheduleTypes {
    hourly = "hourly",
    daily = "daily",
    weekly = "weekly"
}

export const ScheduleTypesDefinitions: { [Name: string]: { title: string, value: ScheduleTypes }; } = {
    weekly: {
        value: ScheduleTypes.weekly,
        title: "Run on specific days, at specific times"
    },
    daily: {
        value: ScheduleTypes.daily,
        title: "Run every day, at specific times"
    },
    hourly: {
        value: ScheduleTypes.hourly,
        title: "Run every few hours"
    }
};

export interface IScheduleHourly {
    ScheduleType: ScheduleTypes.hourly,
    /** run every x number of hours */
    interval: hourlyInterval;
}
export interface IScheduleDaily {
    ScheduleType: ScheduleTypes.daily,
    /** run every day, at these hours */
    hours: hours[];
}
export interface IScheduleWeekly {
    ScheduleType: ScheduleTypes.weekly,
    /** run in the following days */
    days: days[];
    /** run at these hours */
    hours: hours[];
}

export type TypeSchedule = IScheduleHourly | IScheduleDaily | IScheduleWeekly;

export const defaultWeeklySchedule: IScheduleWeekly = {
    ScheduleType: ScheduleTypes.weekly,
    days: [1, 2, 3, 4, 5],
    hours: [0]
};
export const defaultDailySchedule: IScheduleDaily = {
    ScheduleType: ScheduleTypes.daily,
    hours: [0, 12]
};
export const defaultHourlySchedule: IScheduleHourly = {
    ScheduleType: ScheduleTypes.hourly,
    interval: 4
};

export function isValidSchedule(schedule: TypeSchedule) {
    if (isNullOrUndefined(schedule)) return false;
    if (schedule.ScheduleType === ScheduleTypes.hourly)
        return schedule.interval > 0 && schedule.interval <= 12;
    else if (schedule.ScheduleType === ScheduleTypes.daily) {
        return isNotEmptyArray(schedule.hours) && schedule.hours.every(h => h >= 0 && h <= 23);
    }
    else if (schedule.ScheduleType === ScheduleTypes.weekly) {
        return isNotEmptyArray(schedule.hours) && schedule.hours.every(h => h >= 0 && h <= 23)
            && isNotEmptyArray(schedule.days) && schedule.days.every(d => d >= 0 && d <= 6);
    }
    else return false;
}
/** returns a yyyyMMddHH for the next time this schedule needs to run after the currentDate */
export function getNextUTC(currentDate: Date, schedule: TypeSchedule): string {
    if (!isValidSchedule(schedule)) return "9999999999";

    currentDate = cloneDate(currentDate);

    let date = currentDate.getUTCDate();
    let hour = currentDate.getUTCHours();
    let day = currentDate.getUTCDay() as days;

    //adjust date based on selected schedule
    if (schedule.ScheduleType === ScheduleTypes.hourly) {
        hour += schedule.interval;
        currentDate.setUTCHours(hour);
    }
    else if (schedule.ScheduleType === ScheduleTypes.daily) {
        //get current hour, see if the next run is today or tomorrow
        let sortedHours = schedule.hours.sort(sortNumberArrayAsc);
        let nextHour = firstOrNull(sortedHours.filter(h => h > hour));
        if (nextHour !== null) {
            currentDate.setUTCHours(nextHour);
        }
        else {
            //tomorrow at the first scheduled hour
            currentDate.setUTCHours(sortedHours[0]);
            currentDate.setUTCDate(date + 1);
        }
    }
    else {
        //implement weekly
        let sortedDays = schedule.days.sort(sortNumberArrayAsc);
        let sortedHours = schedule.hours.sort(sortNumberArrayAsc);
        let nextHour = firstOrNull(sortedHours.filter(h => h > hour));
        let nextDay = firstOrNull(sortedDays.filter(h => h > day));

        if (sortedDays.includes(day) && nextHour !== null)//today is allowed
        {
            currentDate.setUTCHours(nextHour);
        }
        else//move to next allowed day, at first hour allowed
        {
            let daysToAdd = nextDay === null
                ? 7 - day + sortedDays[0]
                : nextDay - day;
            currentDate.setUTCHours(sortedHours[0]);
            currentDate.setUTCDate(date + daysToAdd);
        }
    }

    return getUTCDateMarker(currentDate);
}

export function getUTCDateMarker(date: Date) {
    return `${date.getUTCFullYear()}${padLeft(date.getUTCMonth() + 1, 2)}${padLeft(date.getUTCDate(), 2)}${padLeft(date.getUTCHours(), 2)}`;
}