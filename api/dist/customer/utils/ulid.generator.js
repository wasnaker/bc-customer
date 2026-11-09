"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUlid = generateUlid;
exports.isValidUlid = isValidUlid;
/**
 * Minimal ULID generator (no external dependency).
 *
 * A ULID is 26 chars of Crockford Base32:
 *  - 10 chars: 48-bit timestamp (ms since Unix epoch), big-endian
 *  - 16 chars: 80 bits of randomness
 *
 * This is a "ULID-like" generator: monotonicity within the same millisecond
 * is not guaranteed, but uniqueness via random part + the unique index on the
 * column is sufficient for this module.
 */
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const TIME_LEN = 10;
const RANDOM_LEN = 16;
const ULID_LEN = TIME_LEN + RANDOM_LEN; // 26
/** Encode a non-negative integer as fixed-width big-endian Crockford Base32. */
function encodeTime(now, length) {
    const chars = new Array(length).fill('0');
    let n = now;
    for (let i = length - 1; i >= 0; i--) {
        chars[i] = CROCKFORD[n % 32];
        n = Math.floor(n / 32);
    }
    return chars.join('');
}
/** Encode `length` random chars of Crockford Base32. */
function encodeRandom(length) {
    let out = '';
    for (let i = 0; i < length; i++) {
        // Random in [0, 32) — slight modulo bias is acceptable here.
        out += CROCKFORD[Math.floor(Math.random() * 32)];
    }
    return out;
}
/** Generate a 26-char ULID-like string (Crockford Base32, uppercase). */
function generateUlid() {
    const now = Date.now();
    return encodeTime(now, TIME_LEN) + encodeRandom(RANDOM_LEN);
}
/** Validate a candidate ULID (26 chars, Crockford alphabet). */
function isValidUlid(value) {
    if (typeof value !== 'string' || value.length !== ULID_LEN)
        return false;
    return /^[0-9ABCDEFGHJKMNPQRSTVWXYZ]{26}$/.test(value.toUpperCase());
}
