/**
 * Error 422 dari API modul customer: `{ errors: { field: 'messageKey' } }`.
 * Hooks melempar CustomerApiError agar dialog bisa memetakan tiap field ke
 * pesan terjemahan `errors.<messageKey>` (lihat module-customer.json).
 */
export class CustomerApiError extends Error {
  /** field → messageKey, mis. `{ name: "customerNameAlreadyExists" }`. */
  readonly errors: Record<string, string>;

  constructor(errors: Record<string, string>) {
    super(Object.values(errors).join(", "));
    this.name = "CustomerApiError";
    this.errors = errors;
  }
}

/** Ambil daftar messageKey dari error apa pun yang dikenal. */
export function extractErrorKeys(error: unknown): string[] {
  if (error instanceof CustomerApiError) {
    return Object.values(error.errors);
  }
  return [];
}

/** Pesan generik untuk error yang bukan 422 terstruktur. */
export function extractErrorMessage(
  error: unknown,
  fallback = "unknown",
): string {
  if (error instanceof CustomerApiError) {
    return Object.values(error.errors).join(", ");
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
