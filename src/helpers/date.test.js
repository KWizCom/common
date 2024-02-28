import assert from 'assert/strict';
import test from 'node:test';
import { shiftMonths, getTotalDaysInMonth, getDateFromToken, isISODate, isISODateUTC, isNowToken, isStandardDate, isTodayToken } from "./date";

test('isTodayToken', t => {
    assert.strictEqual(isTodayToken(''), false);
    assert.strictEqual(isTodayToken('today'), false);
    assert.strictEqual(isTodayToken('[ to day]'), false);
    assert.strictEqual(isTodayToken('[today ]'), false);
    assert.strictEqual(isTodayToken('asd[today]'), false);
    assert.strictEqual(isTodayToken('[today]adsd'), true);
    assert.strictEqual(isTodayToken('[today] asd'), true);
    assert.strictEqual(isTodayToken('[today]'), true);
});

test('isNowToken', t => {
    assert.strictEqual(isNowToken(''), false);
    assert.strictEqual(isNowToken('now'), false);
    assert.strictEqual(isNowToken('[ now]'), false);
    assert.strictEqual(isNowToken('[now ]'), false);
    assert.strictEqual(isNowToken('asd[now]'), false);
    assert.strictEqual(isNowToken('[now]adsd'), true);
    assert.strictEqual(isNowToken('[now] asd'), true);
    assert.strictEqual(isNowToken('[now]'), true);
});

test('getDateFromToken', t => {
    let now = new Date();
    assert.strictEqual(getDateFromToken('[today]+1', { now: now }).getTime(), (now.getTime() + (24 * 60 * 60 * 1000)));
    assert.strictEqual(getDateFromToken('[today]-1', { now: now }).getTime(), (now.getTime() + (-24 * 60 * 60 * 1000)));
    assert.strictEqual(getDateFromToken('[now]+15', { now: now }).getTime(), (now.getTime() + (+15 * 60 * 1000)));
    assert.strictEqual(getDateFromToken('[now]-15', { now: now }).getTime(), (now.getTime() + (-15 * 60 * 1000)));

    let test = new Date(now.getTime());
    test.setHours(0, 0, 0, 0);
    assert.strictEqual(getDateFromToken('[today]+1', { now: now, zeroTimeForToday: true }).getTime(), (test.getTime() + (24 * 60 * 60 * 1000)));
    assert.strictEqual(getDateFromToken('[today]-1', { now: now, zeroTimeForToday: true }).getTime(), (test.getTime() + (-24 * 60 * 60 * 1000)));

});

test('isStandardDate', t => {   
    assert.strictEqual(isStandardDate(''), false);
    assert.strictEqual(isStandardDate('2023-08-21T15:54:14.954Z'), false);
    assert.strictEqual(isStandardDate('2023-08-21T15:54:14.954'), false);
    assert.strictEqual(isStandardDate('2023-08-21T15:54:14Z'), false);
    assert.strictEqual(isStandardDate('2023-08-21T15:54:14'), false);
    assert.strictEqual(isStandardDate('2023-08-21T15:54'), true);    
});

test('isISODate', t => {   
    assert.strictEqual(isISODate(''), false);
    assert.strictEqual(isISODate('2023-08-21T15:54:14.954Z'), true);
    assert.strictEqual(isISODate('2023-08-21T15:54:14.954'), true);
    assert.strictEqual(isISODate('2023-08-21T15:54:14Z'), true);
    assert.strictEqual(isISODate('2023-08-21T15:54:14'), true);
    assert.strictEqual(isISODate('2023-08-21T15:54'), false);    
});

test('isISODateUTC', t => {   
    assert.strictEqual(isISODateUTC(''), false);
    assert.strictEqual(isISODateUTC('2023-08-21T15:54:14.954Z'), true);
    assert.strictEqual(isISODateUTC('2023-08-21T15:54:14.954'), false);
    assert.strictEqual(isISODateUTC('2023-08-21T15:54:14Z'), true);
    assert.strictEqual(isISODateUTC('2023-08-21T15:54:14'), false);
    assert.strictEqual(isISODateUTC('2023-08-21T15:54'), false);    
});

test('getTotalDaysInMonth', t => {   
    var d = new Date("01-01-2023");    
    assert.strictEqual(getTotalDaysInMonth(d), 31);
    
    d = new Date("09-01-2023");
    assert.strictEqual(getTotalDaysInMonth(d), 30);
    
    d = new Date("02-01-2023");
    assert.strictEqual(getTotalDaysInMonth(d), 28);
    
    d = new Date("02-01-2024"); //leap year
    assert.strictEqual(getTotalDaysInMonth(d), 29);
});

test('shiftMonths', t => {   
    var d = new Date("01-31-2023");    
    shiftMonths(d, 1)
    assert.strictEqual(d.getMonth() + 1, 2);
    assert.strictEqual(d.getDate(), 28);
    
    d = new Date("01-31-2023");    
    shiftMonths(d, 13)
    assert.strictEqual(d.getMonth() + 1, 2);
    assert.strictEqual(d.getDate(), 29); //leap year

    d = new Date("01-31-2023");    
    shiftMonths(d, -11)
    assert.strictEqual(d.getMonth() + 1, 2);
    assert.strictEqual(d.getDate(), 28);
});