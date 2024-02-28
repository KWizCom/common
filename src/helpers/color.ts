import { isNullOrEmptyString } from "./typecheckers";

/** get the oposite color of a color, or the best contrasting black or white. This is useful to know which color text to show on a dynamic background color */
export function invertColor(color: string, blackOrWhite?: boolean, defaultIfEmpty?: string) {
    if (isNullOrEmptyString(color) && !isNullOrEmptyString(defaultIfEmpty)) return defaultIfEmpty;
    let rgba = colorToRGBA(color);

    if (blackOrWhite) {
        // http://stackoverflow.com/a/3943023/112731
        return (rgba.r * 0.299 + rgba.g * 0.587 + rgba.b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    let _r = (255 - rgba.r);
    let _g = (255 - rgba.g);
    let _b = (255 - rgba.b);
    // pad each with zeros and return
    return "#" + byteToHex(_r) + byteToHex(_g) + byteToHex(_b);
}


/** Returns the color as an array of [r, g, b, a] -- all range from 0 - 255 */
export function colorToRGBA(color: string) {
    // Returns the color as an array of [r, g, b, a] -- all range from 0 - 255
    // color must be a valid canvas fillStyle. This will cover most anything
    // you'd want to use.
    // Examples:
    // colorToRGBA('red')  # [255, 0, 0, 255]
    // colorToRGBA('#f00') # [255, 0, 0, 255]
    let cvs = document.createElement('canvas');
    cvs.height = 1;
    cvs.width = 1;
    let ctx = cvs.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    let data = ctx.getImageData(0, 0, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2], a: data[3] };
}

function byteToHex(num: number) {
    // Turns a number (0-255) into a 2-character hex number (00-ff)
    return ('0' + num.toString(16)).slice(-2);
}

/** Convert any CSS color to a hex representation, returns #000000 */
export function colorToHex(color: string) {
    // 
    // Examples:
    // colorToHex('red')            # '#ff0000'
    // colorToHex('rgb(255, 0, 0)') # '#ff0000'
    let rgba = colorToRGBA(color);
    let hex = byteToHex(rgba.r) + byteToHex(rgba.g) + byteToHex(rgba.b);
    return "#" + hex;
}