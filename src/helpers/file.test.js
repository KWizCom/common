import assert from 'assert/strict';
import test from 'node:test';
import { validateFilename, validateFoldername } from './file'

test('validateFilename', t => {
    '"*:<>?/\\|'.split("").forEach((char) => {
        let result = validateFilename(`random${char}filename.txt`);
        assert.strictEqual(result.valid, false);
        assert.strictEqual(result.hasIllegalCharacter, true);
    });

    ".lock|CON|PRN|AUX|NUL|COM3|COM9|COM0|LPT8|LPT2|LPT6|random_VTI_filename|~$randomfilename".split("|").forEach((name) => {
        let result = validateFilename(`${name}.txt`);
        assert.strictEqual(result.valid, false);
        assert.strictEqual(result.hasIllegalName, true);
    });

    let result = validateFilename(`desktop.ini`);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.hasIllegalName, true);

    ["filename.txt", "test.jpg", "image.png", "worddocument.doc"].forEach((name) => {
        result = validateFilename(name);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.hasIllegalName, false);
    });
});

test('validateFoldername', t => {
    '"*:<>?/\\|'.split("").forEach((char) => {
        let result = validateFoldername(`random${char}folder`);
        assert.strictEqual(result.valid, false);
        assert.strictEqual(result.hasIllegalCharacter, true);
    });

    ".lock|CON|PRN|AUX|NUL|COM3|COM9|COM0|LPT8|LPT2|LPT6|random_VTI_folder|~$randomfolder".split("|").forEach((name) => {
        let result = validateFoldername(`${name}`);
        assert.strictEqual(result.valid, false);
        assert.strictEqual(result.hasIllegalName, true);
    });

    let result = validateFoldername(`desktop.ini`);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.hasIllegalName, true);

    ["folder1", "imagesfolder", "assets", "kwizcom"].forEach((name) => {
        result = validateFoldername(name);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.hasIllegalName, false);
    });
});