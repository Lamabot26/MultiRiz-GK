import crypto from "crypto";

/** Standalone sync password hash for seed scripts (scrypt, same format as lib/auth) */
export function hashPasswordSync(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
