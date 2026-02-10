// ==================================================================
// Admin Movements Service - Admin-specific movement operations
// ==================================================================

import { supabase } from '../supabaseClient';
import { MovimientoPrestamo } from '@/types/database.types';
import { getLoanBalance } from './loans.service';

export interface AdminMovementServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Forgive (eliminate) the remaining debt on a loan
 * Creates a negative adjustment movement to zero out the balance
 * and closes the loan
 * @param loanId ID of the loan to forgive
 * @param note Optional note explaining the forgiveness
 * @returns Movement created
 */
export async function forgiveLoanDebt(
    loanId: number,
    note?: string
): Promise<AdminMovementServiceResponse<MovimientoPrestamo>> {
    try {
        // Get current balance
        const balanceResponse = await getLoanBalance(loanId);
        if (!balanceResponse.success || balanceResponse.data === undefined) {
            return {
                success: false,
                error: 'Error al obtener saldo del préstamo',
            };
        }

        const currentBalance = balanceResponse.data;

        // If balance is already zero or negative, nothing to forgive
        if (currentBalance <= 0) {
            return {
                success: false,
                error: 'El préstamo no tiene deuda pendiente',
            };
        }

        // Create negative adjustment to zero out the debt
        const { data: movement, error: movementError } = await supabase
            .from('movimientos_prestamo')
            .insert({
                prestamo_id: loanId,
                tipo: 'ajuste',
                monto: -currentBalance, // Negative to reduce balance to zero
                nota: note || 'Condonación de deuda',
            })
            .select()
            .single();

        if (movementError) {
            console.error('Error al crear movimiento de condonación:', movementError);
            return { success: false, error: 'Error al condonar deuda' };
        }

        // Update loan status to pardoned
        const { error: updateError } = await supabase
            .from('prestamos')
            .update({ estado: 'perdonado' })
            .eq('id', loanId);

        if (updateError) {
            console.error('Error al actualizar estado del préstamo:', updateError);
            // Don't fail the whole operation, movement was already created
        }

        return { success: true, data: movement };
    } catch (error) {
        console.error('Error en forgiveLoanDebt:', error);
        return { success: false, error: 'Error al condonar deuda' };
    }
}

/**
 * Get all movements for a specific user (across all their loans)
 * @param userId ID of the user
 * @returns List of all movements
 */
export async function getUserMovements(
    userId: number
): Promise<AdminMovementServiceResponse<MovimientoPrestamo[]>> {
    try {
        // First get all loan IDs for the user
        const { data: loans, error: loansError } = await supabase
            .from('prestamos')
            .select('id')
            .eq('usuario_id', userId);

        if (loansError) {
            console.error('Error al obtener préstamos:', loansError);
            return { success: false, error: 'Error al obtener movimientos' };
        }

        if (!loans || loans.length === 0) {
            return { success: true, data: [] };
        }

        const loanIds = loans.map((l) => l.id);

        // Get all movements for those loans
        const { data: movements, error: movementsError } = await supabase
            .from('movimientos_prestamo')
            .select('*')
            .in('prestamo_id', loanIds)
            .order('fecha', { ascending: false });

        if (movementsError) {
            console.error('Error al obtener movimientos:', movementsError);
            return { success: false, error: 'Error al obtener movimientos' };
        }

        return { success: true, data: movements || [] };
    } catch (error) {
        console.error('Error en getUserMovements:', error);
        return { success: false, error: 'Error al obtener movimientos' };
    }
}

/**
 * Get movements for a specific loan
 * @param loanId ID of the loan
 * @returns List of movements for the loan
 */
export async function getLoanMovements(
    loanId: number
): Promise<AdminMovementServiceResponse<MovimientoPrestamo[]>> {
    try {
        const { data, error } = await supabase
            .from('movimientos_prestamo')
            .select('*')
            .eq('prestamo_id', loanId)
            .order('fecha', { ascending: false });

        if (error) {
            console.error('Error al obtener movimientos del préstamo:', error);
            return { success: false, error: 'Error al obtener movimientos' };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error en getLoanMovements:', error);
        return { success: false, error: 'Error al obtener movimientos' };
    }
}
