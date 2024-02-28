import assert from 'assert/strict';
import test from 'node:test';
import { isEmptyObject, isNullOrEmptyString, isPrimitiveValue } from './typecheckers';

test('isNullOrEmptyString', async t => {
    // This test passes because it does not throw an exception.
    await t.test("null", t => assert.strictEqual(isNullOrEmptyString(null), true));
    await t.test("undefined", t => assert.strictEqual(isNullOrEmptyString(undefined), true));
    await t.test("empty string", t => assert.strictEqual(isNullOrEmptyString(""), true));
    await t.test("space", t => assert.strictEqual(isNullOrEmptyString(" "), false));
    await t.test("0", t => assert.strictEqual(isNullOrEmptyString(0), false));
    await t.test("1", t => assert.strictEqual(isNullOrEmptyString(1), false));
});

test('isEmptyObject', async t => {
    await t.test("null", t => assert.strictEqual(isEmptyObject(null), true));
    await t.test("undefined", t => assert.strictEqual(isEmptyObject(undefined), true));
    await t.test("[]", t => assert.strictEqual(isEmptyObject([]), true));
    await t.test("{}", t => assert.strictEqual(isEmptyObject({}), true));
    await t.test("ignore keys", t => assert.strictEqual(isEmptyObject({ test: 1 }, { ignoreKeys: ["test"] }), true));
    await t.test("[1]", t => assert.strictEqual(isEmptyObject([1]), false));
    await t.test("non empty object", t => assert.strictEqual(isEmptyObject({ test: 1 }), false));
    await t.test("non empty object with ignored key", t => assert.strictEqual(isEmptyObject({ test: 1, test2: 2 }, { ignoreKeys: ["test"] }), false));
});

test('isPrimitiveValue', async t => {
    assert.strictEqual(isPrimitiveValue(1.42), true);
    assert.strictEqual(isPrimitiveValue(new Date()), true);
    assert.strictEqual(isPrimitiveValue({ title: "hello" }), false);
    assert.strictEqual(isPrimitiveValue("hello"), true);
    assert.strictEqual(isPrimitiveValue(() => { }), false);
    assert.strictEqual(isPrimitiveValue([1, 2, 3]), false);
    assert.strictEqual(isPrimitiveValue([]), false);
    assert.strictEqual(isPrimitiveValue(), true);
});