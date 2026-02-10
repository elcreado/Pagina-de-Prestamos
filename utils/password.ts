// ==================================================================
// Password Utilities - Funciones para hashing de contraseñas
// ==================================================================

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

/**
 * Compare a plain text password with a hash
 * @param password Plain text password
 * @param hash Hashed password to compare against
 * @returns True if password matches
 */
export async function comparePassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
