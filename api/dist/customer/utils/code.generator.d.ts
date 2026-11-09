export declare const CODE_LENGTH = 6;
/**
 * Generate a 6-char Crockford Base32 code from an id.
 * Deterministic per id: the same id always yields the same code.
 */
export declare function generateCode(id: bigint | number | string): string;
