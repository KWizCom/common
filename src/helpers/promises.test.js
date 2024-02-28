import assert from 'assert/strict';
import test from 'node:test';
import { promiseOnce } from './promises';


test('promiseOnce', async t => {
    var promiseOnceTester = promiseOnce("promiseOnceTester", async () => {
        return Date.now();
    });

    let value = await promiseOnceTester;
    await t.test("First call", t => assert.strictEqual(value > 0, true));
    //check cache
    let value2 = await promiseOnceTester;
    await t.test("Second call", t => assert.strictEqual(value === value2, true));
    let value3 = await promiseOnceTester;
    await t.test("Third call", t => assert.strictEqual(value === value3, true));
});