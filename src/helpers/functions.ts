import { isFunction } from "./typecheckers";

export function wrapFunction<ValueType, ReturnType>(f: (value: ValueType) => ReturnType, props: {
    before?: (value: ValueType) => ValueType;
    after?: (value: ValueType, returned: ReturnType) => void;
}) {
    return (v: ValueType) => {
        if (isFunction(props.before)) {
            v = props.before(v);
        }
        let result = f(v);
        if (isFunction(props.after))
            props.after(v, result);

        return result;
    };
}