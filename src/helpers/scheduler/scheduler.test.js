import assert from 'assert/strict';
import test from 'node:test';
import { isValidSchedule, getNextUTC } from "./scheduler";
import { ScheduleTypes } from './scheduler';

var startDate = "2020-01-01T05:00Z";
var invalidOutput = "9999999999";
var schedules = [
    { schedule: {}, output: invalidOutput, valid: false },
    { schedule: { ScheduleType: "x" }, output: invalidOutput, valid: false },
    {
        schedule: {
            ScheduleType: ScheduleTypes.hourly,
            interval: 24
        }, output: invalidOutput, valid: false
    },
    {
        name: "move 2 hours",
        schedule: {
            ScheduleType: ScheduleTypes.hourly,
            interval: 2
        }, output: "2020010107", valid: true
    },
    {
        schedule: {
            ScheduleType: ScheduleTypes.daily,
            hours: []
        }, output: invalidOutput, valid: false
    },
    {
        schedule: {
            ScheduleType: ScheduleTypes.daily,
            hours: [5, 2, 9, 26]
        }, output: invalidOutput, valid: false
    },
    {
        name: "move to next hour in same day",
        schedule: {
            ScheduleType: ScheduleTypes.daily,
            hours: [5, 2, 9, 22]
        }, output: "2020010109", valid: true
    },
    {
        name: "passed last hour, move to next day",
        schedule: {
            ScheduleType: ScheduleTypes.daily,
            hours: [3, 1, 5, 2]
        }, output: "2020010201", valid: true
    },
    {
        schedule: {
            ScheduleType: ScheduleTypes.weekly,
            hours: []
        }, output: invalidOutput, valid: false
    },
    {
        schedule: {
            ScheduleType: ScheduleTypes.weekly,
            hours: [5, 2, 9, 26],
            days: [2],
        }, output: invalidOutput, valid: false
    },
    {
        schedule: {
            ScheduleType: ScheduleTypes.weekly,
            hours: [5, 2, 9, 22],
            days: [5, 2, 7]
        }, output: invalidOutput, valid: false
    },
    {
        name: "day is no ok, move to next day first hour",
        schedule: {
            ScheduleType: ScheduleTypes.weekly,
            hours: [5, 2, 9, 22],
            days: [5, 2, 4]
        }, output: "2020010202", valid: true
    },
    {
        name: "day is not ok, move to first day in next week",
        schedule: {
            ScheduleType: ScheduleTypes.weekly,
            hours: [5, 2, 9, 22],
            days: [2, 0, 1]
        }, output: "2020010502", valid: true
    },
    {
        name: "day is ok, move to next hour",
        schedule: {
            ScheduleType: ScheduleTypes.weekly,
            hours: [5, 2, 9, 22],
            days: [5, 2, 3, 4]
        }, output: "2020010109", valid: true
    }
];


test('isValidSchedule', t => {
    schedules.forEach(s => assert.strictEqual(isValidSchedule(s.schedule), s.valid));
});

test('getNextUTC', async t => {
    let date = new Date(startDate);
    schedules.forEach(s => assert.strictEqual(getNextUTC(date, s.schedule), s.output));
});