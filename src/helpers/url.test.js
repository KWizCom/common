import assert from 'assert/strict';
import test from 'node:test';
import { makeFullUrl, parseHash, parseQueryString, removeUrlKeyValue, setUrlKeyValue, } from './url';

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
    //fix # to full URL
    assert.deepEqual(makeFullUrl("#hashnav", "http://foo"), "http://foo#hashnav");
    assert.deepEqual(makeFullUrl("#hashnav2", "http://foo#hashnav"), "http://foo#hashnav2");
    assert.deepEqual(makeFullUrl("#hashnav", "http://foo/page.aspx"), "http://foo/page.aspx#hashnav");
});

test('removeUrlKeyValue', t => {
    let trueUrl = "https://www.domain.com/page.aspx?showindatasheet=true";
    let falseUrl = "https://www.domain.com/page.aspx?showindatasheet=false";
    let noParamUrl = "https://www.domain.com/page.aspx";

    let output = removeUrlKeyValue("showindatasheet", trueUrl, true);
    assert.deepEqual(output, noParamUrl);

    output = removeUrlKeyValue("ShowInDataSheet", trueUrl, true);
    assert.deepEqual(output, noParamUrl);

    output = setUrlKeyValue("showindatasheet", "false", false, trueUrl);
    assert.deepEqual(output, falseUrl)
});