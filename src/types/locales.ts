export type SysNumberFormatType = {
    CurrencyDecimalDigits: number;
    CurrencyDecimalSeparator: string;
    IsReadOnly: boolean;
    CurrencyGroupSizes: number[];
    NumberGroupSizes: number[];
    PercentGroupSizes: number[];
    CurrencyGroupSeparator: string;
    CurrencySymbol: string;
    NaNSymbol: string;
    CurrencyNegativePattern: number;
    NumberNegativePattern: number;
    PercentPositivePattern: number;
    PercentNegativePattern: number;
    NegativeInfinitySymbol: string;
    NegativeSign: string;
    NumberDecimalDigits: number;
    NumberDecimalSeparator: string;
    NumberGroupSeparator: string;
    CurrencyPositivePattern: number;
    PositiveInfinitySymbol: string;
    PositiveSign: string;
    PercentDecimalDigits: number;
    PercentDecimalSeparator: string;
    PercentGroupSeparator: string;
    PercentSymbol: string;
    PerMilleSymbol: string;
    NativeDigits: string[];
    DigitSubstitution: number;
};

export type SysDateFormatType = {
    AMDesignator: string;
    Calendar: {
        MinSupportedDateTime: string;
        MaxSupportedDateTime: string;
        AlgorithmType: number;
        CalendarType: number;
        Eras: number[];
        TwoDigitYearMax: number;
        IsReadOnly: boolean;
    };
    DateSeparator: string;
    FirstDayOfWeek: number;
    CalendarWeekRule: number;
    FullDateTimePattern: string;
    LongDatePattern: string;
    LongTimePattern: string;
    MonthDayPattern: string;
    PMDesignator: string;
    RFC1123Pattern: string;
    ShortDatePattern: string;
    ShortTimePattern: string;
    SortableDateTimePattern: string;
    TimeSeparator: string;
    UniversalSortableDateTimePattern: string;
    YearMonthPattern: string;
    AbbreviatedDayNames: string[];
    ShortestDayNames: string[];
    DayNames: string[];
    AbbreviatedMonthNames: string[];
    MonthNames: string[];
    IsReadOnly: boolean;
    NativeCalendarName: string;
    AbbreviatedMonthGenitiveNames: string[];
    MonthGenitiveNames: string[];
    eras: any[];
};
export type CultureInfoType = {
    LCID: number;
    name: string;
    numberFormat: SysNumberFormatType;
    dateTimeFormat: SysDateFormatType;
    ShortDatePattern?: string;
    ShortTimePattern?: string;
    DateSeparator?: string;
    TimeSeparator?: string;
    CurrencySymbol?: string;
    PercentSymbol?: string;
    NumberDecimalSeparator?: string;
    NumberGroupSeparator?: string;
};

export interface IKLocales {
    getCultureNameOrLCIDFromContextInfo(s: number): string | number;
    GetCulture(cultureNameOrLCID: string | number): CultureInfoType;
    GetCurrentCulture(): CultureInfoType;
    SetCurrentCulture(culture: CultureInfoType);
    ParseDate(strDate: string, culture?: CultureInfoType): Date;
    /** default format: date only */
    DateToString(dateObj: Date, culture: CultureInfoType, format?: { includeDate?: boolean; includeTime?: boolean; }): string;
    ParseNumber(strNumber: string, culture?: CultureInfoType): number;
    /** isPercentAsWholeNumbers means a percent number that is 1 to 100, not 0-1. will not multiply it by 100. */
    NumberToString(num: number,
        /** current web cutlure, default=GetCurrentCulture */
        webCulture?: CultureInfoType,
        numFormat?: {
            /** default=false */
            includeGroupSeparator?: boolean;
            /** default=false */
            isPercent?: boolean;
            /** isPercentAsWholeNumbers means a percent number that is 1 to 100, not 0-1. will not multiply it by 100, default=false */
            isPercentAsWholeNumbers?: boolean;
            /** default=false */
            isCurrency?: boolean;
            /** default=webCulture.LCID */
            currencyLocaleId?: number;
            /** default=false */
            numberOnly?: boolean;
        }): string;
    IsValidNumber(strNumber: string, culture: CultureInfoType): boolean;
}

declare global {
    interface Date {
        /**
        * Formats a date by using the invariant (culture-independent) culture.
        */
        format(format: string): string;
    }
    
    interface IKWizComGlobals {
        kLocales?: IKLocales;
    }
}