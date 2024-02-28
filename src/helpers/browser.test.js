import assert from 'assert/strict';
import test from 'node:test';
import { DisableAnchorInterceptInHtml } from "./browser";

test('DisableAnchorInterceptInHtml', async t => {
    assert.strictEqual(DisableAnchorInterceptInHtml(`<a href="blah">test</a>`), `<a data-interception="off" href="blah">test</a>`);
    assert.strictEqual(DisableAnchorInterceptInHtml(`<div><a href="blah">test</a><a href="blah">test</a></div>`), `<div><a data-interception="off" href="blah">test</a><a data-interception="off" href="blah">test</a></div>`);
    assert.strictEqual(DisableAnchorInterceptInHtml(`<p href="blah">test</p>`), `<p href="blah">test</p>`);
});