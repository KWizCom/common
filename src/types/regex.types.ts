import { IDictionary } from "./common.types";

export interface IRegexExpression {
    pattern: string;
    example: string;
    options: string[];
    isDefault: boolean;
}

export interface IRegexList extends IDictionary<IRegexExpression> {
}

declare global {
    interface IModernListSettings {
        RegexList?: IRegexList;
    }
}