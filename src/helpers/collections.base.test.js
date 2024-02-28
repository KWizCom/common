import assert from 'assert/strict';
import test from 'node:test';
import { forEachAsync, makeUniqueArray, numbersArray } from "./collections.base";

test('forEachAsync', async t => {
    let results = await forEachAsync([1, 2, 3], num => Promise.resolve(num * 2));
    assert.deepEqual(results, [2, 4, 6]);
    results = await forEachAsync([1, 2, 3], num => Promise.resolve(num * 2), { parallel: true });
    assert.deepEqual(results, [2, 4, 6]);
    results = await forEachAsync(null, num => Promise.resolve(num * 2), { parallel: true });
    assert.deepEqual(results, []);
    results = await forEachAsync("test", str => Promise.resolve(`Char: ${str}`), { parallel: true });
    assert.deepEqual(results, ["Char: t", "Char: e", "Char: s", "Char: t"]);
});

test('makeUniqueArray', async t => {
    assert.strictEqual(makeUniqueArray([1, 2, 5, 5, 2]).length, 3);
    assert.strictEqual(makeUniqueArray([]).length, 0);
    assert.strictEqual(makeUniqueArray([1]).length, 1);
});

test('numbersArray', t => {
    assert.deepEqual(numbersArray(), []);
    assert.deepEqual(numbersArray(2), [0, 1]);
    assert.deepEqual(numbersArray(2, 2), [2, 3]);
});