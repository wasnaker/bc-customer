import { IPaginationOptions } from './types/pagination-options';
import { InfinityPaginationResponseDto } from './dto/infinity-pagination-response.dto';
export declare const infinityPagination: <T>(data: T[], options: IPaginationOptions, total: number) => InfinityPaginationResponseDto<T>;
