//eval breaks treeshaking for the entire module it is in, so keep it in separate
export function eval2(str: string) {
    // eslint-disable-next-line no-eval
    return eval(str);
}
