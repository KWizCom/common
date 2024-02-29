import assert from 'assert/strict';
import test from 'node:test';
import { capitalizeFirstLetter, escapeXml, replaceAll, replaceRegex } from './strings';

test('replaceAll', t => {
    assert.strictEqual(replaceAll("hello old#@! world old#@! !", "old#@!", "new!@$"), "hello new!@$ world new!@$ !");

    //this failed since the input find included protected regex characters.
    //escapeRegExp needs to fix that
    const source = "string with special regex[:(s:) chars";
    const result = "string with special regex[~~(s~~) chars";
    assert.strictEqual(replaceAll(source, source, result), result);
});

test('capitalizeFirstLetter', async t => {
    assert.strictEqual(capitalizeFirstLetter(), "");
    assert.strictEqual(capitalizeFirstLetter("a"), "A");
    assert.strictEqual(capitalizeFirstLetter("hello"), "Hello");
    assert.strictEqual(capitalizeFirstLetter("hello world!"), "Hello world!");
    assert.strictEqual(capitalizeFirstLetter("helloworld"), "Helloworld");
    assert.strictEqual(capitalizeFirstLetter(""), "");
});

test('escapeXml', async t => {
    assert.strictEqual(escapeXml(), "");
    assert.strictEqual(escapeXml(""), "");
    assert.strictEqual(escapeXml(" "), " ");
    assert.strictEqual(escapeXml("<test />"), "&lt;test /&gt;");
    assert.strictEqual(escapeXml(`full scope: <>&'"`), `full scope: &lt;&gt;&amp;'"`);
    assert.strictEqual(escapeXml(undefined, true), "");
    assert.strictEqual(escapeXml("", true), "");
    assert.strictEqual(escapeXml(" ", true), " ");
    assert.strictEqual(escapeXml("<test />", true), "&lt;test /&gt;");
    assert.strictEqual(escapeXml(`full scope: <>&'"`, true), `full scope: &lt;&gt;&amp;&apos;&quot;`);
});

test('replaceRegex', t => {
    /** Match anything between {zone:*} */
    var match = /{zone:\w+}/gi;

    var source = `text {zone:one} {zone:two}
more text
{zone:three}`;
    var result = `text ONE TWO
more text
THREE`;

    assert.strictEqual(replaceRegex(source, match, m => m.slice(1, m.length - 1).split(':')[1].toLocaleUpperCase()), result);

    /** match: "](______)" */
    match = /]\(.+\)/gi;
    source = '[name:root](https://kwizcom.sharepoint.com/:fl:/g/contentstorage)';
    result = '[name:root](https~~~~//kwizcom.sharepoint.com/~~~~fl~~~~/g/contentstorage)';
    assert.strictEqual(replaceRegex(source, match, m => m.replace(/:/gi, "~~~~")), result);
});