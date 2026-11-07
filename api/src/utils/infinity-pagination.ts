import { IPaginationOptions } from './types/pagination-options';
import { InfinityPaginationResponseDto } from './dto/infinity-pagination-response.dto';

export const infinityPagination = <T>(
  data: T[],
  options: IPaginationOptions,
  total: number,
): InfinityPaginationResponseDto<T> => {
  return {
    data,
    total,
    hasNextPage: data.length === options.limit,
  };
};
