"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.infinityPagination = void 0;
const infinityPagination = (data, options, total) => {
    return {
        data,
        total,
        hasNextPage: data.length === options.limit,
    };
};
exports.infinityPagination = infinityPagination;
