import assert from 'assert/strict';
import test from 'node:test';
import { objectsEqual } from './objects';

test('objectsEqual', async t => {
    let now = new Date();
    let next = new Date(now.getTime() + 10000);//add a second
    assert.strictEqual(objectsEqual(1.42, 1.42), true);
    assert.strictEqual(objectsEqual(now, now), true);
    assert.strictEqual(objectsEqual(now, next), false);
    assert.strictEqual(objectsEqual("hello", "bye"), false);
    assert.strictEqual(objectsEqual(() => { console.log(1); }, () => { console.log(1); }), true);
    assert.strictEqual(objectsEqual(() => { console.log(1); }, () => { console.log(2); }), false);
    assert.strictEqual(objectsEqual(
        { id: 1, name: "test", complex: { cid: 4, foo: () => console.log(1) }, nested: { nid: 4, complex: { ncid: 5, time: now } } },
        { id: 1, name: "test", complex: { cid: 4, foo: () => console.log(1) }, nested: { nid: 4, complex: { ncid: 5, time: now } } }),
        true);
    assert.strictEqual(objectsEqual(
        { id: 1, name: "test", complex: { cid: 4, foo: () => console.log(1) }, nested: { nid: 4, complex: { ncid: 5, time: now } } },
        { id: 1, name: "test", complex: { cid: 4, foo: () => console.log(1) }, nested: { nid: 4, complex: { ncid: 5, time: next } } }),
        false);
    assert.strictEqual(objectsEqual(
        { id: 1, name: "test", complex: { cid: 4, foo: () => console.log(1) }, nested: { nid: 4, complex: { ncid: 5, time: now } } },
        { id: 1, name: "test", complex: { cid: 4, foo: () => console.log(1) }, nested: { nid: 4, complex: { ncid: 5, time: next } } },
        ["time"]),
        true);
});