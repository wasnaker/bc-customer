/** Generate a 26-char ULID-like string (Crockford Base32, uppercase). */
export declare function generateUlid(): string;
/** Validate a candidate ULID (26 chars, Crockford alphabet). */
export declare function isValidUlid(value: unknown): value is string;
