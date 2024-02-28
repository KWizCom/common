import assert from 'assert/strict';
import test from 'node:test';
import { parseHash, parseQueryString } from './url';

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