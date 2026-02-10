// ==================================================================
// Validators - Funciones de validación compartidas
// ==================================================================

/**
 * Validate payment amount
 * @param amount Amount to pay
 * @param maxBalance Maximum balance (current debt)
 * @returns Validation result with error message if invalid
 */
export function validatePaymentAmount(
    amount: number,
    maxBalance: number
): { valid: boolean; error?: string } {
    if (amount <= 0) {
        return { valid: false, error: 'El monto debe ser mayor a 0' };
    }

    if (amount > maxBalance) {
        return {
            valid: false,
            error: `El monto no puede exceder el saldo de $${maxBalance.toFixed(2)}`,
        };
    }

    return { valid: true };
}

/**
 * Validate username
 * @param username Username to validate
 * @returns Validation result with error message if invalid
 */
export function validateUsername(username: string): {
    valid: boolean;
    error?: string;
} {
    if (!username || username.trim().length === 0) {
        return { valid: false, error: 'El username es requerido' };
    }

    if (username.length < 3) {
        return { valid: false, error: 'El username debe tener al menos 3 caracteres' };
    }

    if (username.length > 50) {
        return { valid: false, error: 'El username no puede exceder 50 caracteres' };
    }

    // Only alphanumeric and underscores
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        return {
            valid: false,
            error: 'El username solo puede contener letras, números y guiones bajos',
        };
    }

    return { valid: true };
}

/**
 * Validate password
 * @param password Password to validate
 * @returns Validation result with error message if invalid
 */
export function validatePassword(password: string): {
    valid: boolean;
    error?: string;
} {
    if (!password || password.length === 0) {
        return { valid: false, error: 'La contraseña es requerida' };
    }

    if (password.length < 4) {
        return { valid: false, error: 'La contraseña debe tener al menos 4 caracteres' };
    }

    return { valid: true };
}

/**
 * Validate loan data
 * @param data Loan data to validate
 * @returns Validation result with error message if invalid
 */
export function validateLoanData(data: {
    monto_desembolsado: number;
    tasa_interes_mensual?: number;
}): { valid: boolean; error?: string } {
    if (!data.monto_desembolsado || data.monto_desembolsado <= 0) {
        return { valid: false, error: 'El monto debe ser mayor a 0' };
    }

    if (
        data.tasa_interes_mensual !== undefined &&
        data.tasa_interes_mensual < 0
    ) {
        return { valid: false, error: 'La tasa de interés no puede ser negativa' };
    }

    if (
        data.tasa_interes_mensual !== undefined &&
        data.tasa_interes_mensual > 1
    ) {
        return {
            valid: false,
            error: 'La tasa de interés debe ser un decimal (ej: 0.035 para 3.5%)',
        };
    }

    return { valid: true };
}
