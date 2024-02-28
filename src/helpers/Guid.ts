/**
 * This class represents a globally unique identifier, as described by
 * IETF RFC 4122.
 *
 * @remarks
 * The input string is normalized and validated, which provides
 * important guarantees that simplify other code that works with the GUID.
 * This class also provides basic support for generating a pseudo-random GUID;
 * however, be aware that the uniqueness depends on the browser's `Math.random()`
 * function and may be not be suitable for some applications.
 *
 * See {@link https://www.ietf.org/rfc/rfc4122.txt | RFC4122} for more information.
 *
 * @public
 */

import { isNullOrEmptyString, isNullOrUndefined } from "./typecheckers";

export class Guid {
    private _guid;
    /**
    * Returns a new empty Guid instance.
    *
    * @returns A new empty Guid object.
    */
    public static empty = new Guid('00000000-0000-0000-0000-000000000000');
    private static _guidRegEx = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

    /**
     * Use `Guid.parse()` or `Guid.tryParse()` instead of the constructor.
     * @param guid - a normalized, already valid Guid string
     */
    constructor(guid) {
        this._guid = guid;
    }
    /**
     * Returns a new Guid instance with a pseudo-randomly generated GUID, according
     * to the version 4 UUID algorithm from RFC 4122.
     *
     * @returns A new unique Guid object
     */
    public static newGuid(randomNumberGenerator) {
        return new Guid(Guid._generateGuid(randomNumberGenerator));
    }
    /**
     * Parses the input string to construct a new Guid object.
     * If the string cannot be parsed, then an error is thrown.
     *
     * @remarks
     * Example syntaxes accepted by this function:
     *
     * - `"d5369f3bbd7a412a9c0f7f0650bb5489"`
     *
     * - `"d5369f3b-bd7a-412a-9c0f-7f0650bb5489"`
     *
     * - `"{d5369f3b-bd7a-412a-9c0f-7f0650bb5489}"`
     *
     * - `"/Guid(d5369f3b-bd7a-412a-9c0f-7f0650bb5489)/"`
     *
     * @param guid - The input string.
     * @returns A valid Guid object
     */
    public static parse(guidString) {
        var guid = Guid.tryParse(guidString);
        if (!guid) {
            throw new Error(`***Invalid GUID string: "${guidString}"`)
        }
        return guid;
    }
    /**
     * Attempts to parse the input string to construct a new Guid object.
     * If the string cannot be parsed, then undefined is returned.
     *
     * @remarks
     * Example syntaxes accepted by this function:
     *
     * - `"d5369f3bbd7a412a9c0f7f0650bb5489"`
     *
     * - `"d5369f3b-bd7a-412a-9c0f-7f0650bb5489"`
     *
     * - `"{d5369f3b-bd7a-412a-9c0f-7f0650bb5489}"`
     *
     * - `"/Guid(d5369f3b-bd7a-412a-9c0f-7f0650bb5489)/"`
     *
     * @param guid - The input string.
     * @returns The Guid object, or undefined if the string could not be parsed.
     */
    public static tryParse(guid) {
        if (guid) {
            guid = Guid._normalize(guid);
            if (Guid._guidRegEx.test(guid)) {
                return new Guid(guid);
            }
        }
        return undefined;
    }
    /**
     * Indicates whether a GUID is valid, i.e. whether it would be successfully
     * parsed by `Guid.tryParse()`.  This function is cheaper than `Guid.tryParse()`
     * because it does not construct a Guid object.
     *
     * @param guid - The input string.
     * @returns true, if the Guid is valid.
     */
    public static isValid(guid) {
        if (guid) {
            guid = Guid._normalize(guid);
            if (Guid._guidRegEx.test(guid)) {
                return true;
            }
        }
        return false;
    }
    /**
     * SharePoint can have guids in the form:
     *   - `Guid(...)`
     *   - `{...}`
     * _normalize transforms guids in this format to the standard
     * guid format.
     *
     * Example: `Guid(d5369f3b-bd7a-412a-9c0f-7f0650bb5489)` becomes `d5369f3b-bd7a-412a-9c0f-7f0650bb5489`
     * Example: `{d5369f3b-bd7a-412a-9c0f-7f0650bb5489}` becomes `d5369f3b-bd7a-412a-9c0f-7f0650bb5489`
     *
     * @param guid - Guid to be normalized, could already be normalized.
     * @returns Normalized guid.
     */
    private static _normalize(guid) {
        if (isNullOrEmptyString(guid)) {
            throw new Error(`***The value for "guid" must not be an empty string`)
        }
        // Check for Guid(...) and strip
        var result = /^Guid\((.*)\)/i.exec(guid); /* tslint:disable-line:no-null-keyword */
        if (result) {
            guid = result[1];
        }
        // Check for and strip leading or trailing curly braces
        if (guid.length === 38) {
            guid = guid.substr(1, 36);
        }
        return guid.toLowerCase();
    }
    /**
     * Creates a new guid.
     *
     * @returns A valid guid (according to RFC4122)
     */
    private static _generateGuid(randomNumberGenerator) {
        return 'AAAAAAAA-AAAA-4AAA-BAAA-AAAAAAAAAAAA'.replace(/[AB]/g,
            // Callback for String.replace() when generating a guid.
            function (character) {
                var randomNumber = randomNumberGenerator ? randomNumberGenerator.generate() : Math.random();
                /* tslint:disable:no-bitwise */
                var num = randomNumber * 16 | 0;
                // Check for 'A' in template string because the first characters in the
                // third and fourth blocks must be specific characters (according to "version 4" UUID from RFC 4122)
                var masked = character === 'A' ? num : (num & 0x3 | 0x8);
                return masked.toString(16);
            });
    }
    /**
     * Compare this instance to another Guid instance
     *
     * @returns True if this instance and the specified Guid object
     * represent the same value.
     */
    public equals(guid) {
        if (isNullOrUndefined(guid)) {
            throw new Error(`"***The value for "guid" must not be null or undefined"`)
        }
        return guid && this._guid.toString() === guid.toString();
    }
    /**
     * Returns a string representation of the GUID
     *
     * @returns The GUID value in lowercase hexadecimal without braces.
     *
     * Example: `'d5369f3b-bd7a-412a-9c0f-7f0650bb5489'`
     */
    public toString = function () {
        return this._guid;
    }
}