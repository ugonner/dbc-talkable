export interface IQueryResult<TData> {
    data: TData[];
    total: number;
    page: number;
    limit: number;
    
}