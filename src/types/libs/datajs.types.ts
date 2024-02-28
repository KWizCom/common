export interface IDataJsRequestData {
    __batchRequests: IDataJsBatchRequest[];
}
export interface IDataJsBatchRequest {
    requestUri: string;
    method: "GET" | "POST";
    headers: { [key: string]: string; };
}
export interface IDataJsRequest {
    requestUri: string;
    method: "GET" | "POST";
    headers: { [key: string]: string; };
    data: IDataJsRequestData;
}

export interface IDataJsResponseData<ResponseDataType> {
    __batchResponses: { data: ResponseDataType; }[];
}

export interface IDataJsHandler { }

export interface IDataJs {
    batchHandler: IDataJsHandler;
    request<ResponseDataType>(request: IDataJsRequest, success: (data: IDataJsResponseData<ResponseDataType>, response: any) => void,
        error: (error: string) => void,
        handler: IDataJsHandler,
        httpClient?: any,
        metadata?: any): void;
}