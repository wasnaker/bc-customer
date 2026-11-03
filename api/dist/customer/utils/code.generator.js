"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CODE_LENGTH = void 0;
exports.generateCode = generateCode;
/**
 * Short human-readable code generator: 6 chars of Crockford Base32 derived
 * deterministically from the entity's auto-increment id.
 *
 * Formula (placeholder): base32((id * salt) % 32^6) with salt = 1 for now.
 * The salt will later be moved to Settings; codes are stored permanently once
 * issued, so changing the salt only affects future ids.
 */
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
exports.CODE_LENGTH = 6;
/** 32^6 — maximum representable value + 1. */
const MODULUS = 32 ** exports.CODE_LENGTH; // 1,073,741,824
/** Placeholder salt — will be moved to Settings later. */
const SALT = 1;
/**
 * Generate a 6-char Crockford Base32 code from an id.
 * Deterministic per id: the same id always yields the same code.
 */
function generateCode(id) {
    const n = BigInt(id);
    const value = Number((n * BigInt(SALT)) % BigInt(MODULUS));
    const chars = new Array(exports.CODE_LENGTH).fill('0');
    let rest = value;
    for (let i = exports.CODE_LENGTH - 1; i >= 0; i--) {
        chars[i] = CROCKFORD[rest % 32];
        rest = Math.floor(rest / 32);
    }
    return chars.join('');
}
