export function getRandomId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function getUniqueId() {
    var _s_hexcode = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    for (var a = "", c = 0; c < 32; c++) {
        var b = Math.floor(Math.random() * 16);
        switch (c) {
            case 8:
                a += "-";
                break;
            case 12:
                b = 4;
                a += "-";
                break;
            case 16:
                b = b & 3 | 8;
                a += "-";
                break;
            case 20:
                a += "-";
        }
        a += _s_hexcode[b];
    }
    return a;
}
