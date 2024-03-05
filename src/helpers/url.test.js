import assert from 'assert/strict';
import test from 'node:test';
import { makeFullUrl, parseHash, parseQueryString, } from './url';

test('parseQueryString', t => {
    assert.deepEqual(parseQueryString(), {});
    assert.deepEqual(parseQueryString("http://foo"), {});
    assert.deepEqual(parseQueryString("http://foo?p1=1&p2=2"), { p1: '1', p2: '2' });
    assert.deepEqual(parseQueryString("http://foo?p1=1&p2=2#someAnchor"), { p1: '1', p2: '2' });
});
test('parseHash', t => {
    assert.deepEqual(parseHash(), {});
    assert.deepEqual(parseHash("http://foo"), {});
    assert.deepEqual(parseHash("http://foo?p1=1&p2=2"), {});
    assert.deepEqual(parseHash("http://foo?p1=1&p2=2#someAnchor"), { someAnchor: '' });
    assert.deepEqual(parseHash("http://foo?p1=3&p2=4#p1=1&p2=2"), { p1: '1', p2: '2' });
    assert.deepEqual(parseHash("http://foo#p1=1&p2=2"), { p1: '1', p2: '2' });
});

test('makeFullUrl', t => {
    assert.deepEqual(makeFullUrl("http://foo"), "http://foo");
    assert.deepEqual(makeFullUrl("http://foo", "http://fii"), "http://foo");
    assert.deepEqual(makeFullUrl("foo/fii", "http://host/folder"), "http://host/folder/foo/fii");
    assert.deepEqual(makeFullUrl("/foo/fii", "http://host"), "http://host/foo/fii");
});