export interface BaseError {
    code: number;
    message: string;
    payload?: any;
}


export interface BaseResponse<T> {
    data?: T | null,
    error?: BaseError | null
}
