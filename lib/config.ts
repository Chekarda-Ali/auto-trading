/**
 * Centralized environment flags and production safeguards.
 * These flags enable development-only bypasses for admin and billing checks.
 * The guard ensures they cannot be enabled in production.
 */

export const IS_PROD = process.env.NODE_ENV === 'production';
export const IS_DEV = !IS_PROD;

export const FLAGS = {
  BILLING_DISABLED: process.env.BILLING_DISABLED === 'true',
  GRANT_ADMIN_TO_ALL: process.env.GRANT_ADMIN_TO_ALL === 'true',
};

/**
 * Abort runtime when dangerous flags are enabled in production.
 * Should be invoked in critical paths that run server-side.
 */
export function assertProdGuards(): void {
  if (IS_PROD) {
    if (FLAGS.BILLING_DISABLED) {
      throw new Error('BILLING_DISABLED must not be true in production. Refusing to run.');
    }
    if (FLAGS.GRANT_ADMIN_TO_ALL) {
      throw new Error('GRANT_ADMIN_TO_ALL must not be true in production. Refusing to run.');
    }
  }
}

/**
 * Helper to check if a dev-only flag is active (never true in production).
 */
export function devFlagEnabled(flag: boolean): boolean {
  return IS_DEV && flag;
}
