// ==================================================================
// Loans Service - Gestión de préstamos
// ==================================================================

import { supabase } from '../supabaseClient';
import {
    Prestamo,
    CreatePrestamoDTO,
    PrestamoConSaldo,
    SaldoPrestamo,
} from '@/types/database.types';
import { validateLoanData } from '@/utils/validators';

export interface LoanServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Crear préstamo con movimiento de desembolso inicial
 * @param dto Datos del préstamo
 * @returns Préstamo creado
 */
export async function createLoan(
    dto: CreatePrestamoDTO
): Promise<LoanServiceResponse<Prestamo>> {
    try {
        // Validar datos del préstamo
        const validation = validateLoanData({
            monto_desembolsado: dto.monto_desembolsado,
            tasa_interes_mensual: dto.tasa_interes_mensual,
        });

        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        // Insertar préstamo
        const { data: prestamo, error: prestamoError } = await supabase
            .from('prestamos')
            .insert({
                usuario_id: dto.usuario_id,
                moneda: dto.moneda || 'COP',
                monto_desembolsado: dto.monto_desembolsado,
                tasa_interes_mensual: dto.tasa_interes_mensual || 0,
                fecha_inicio: dto.fecha_inicio || new Date().toISOString().split('T')[0],
                fecha_vencimiento: dto.fecha_vencimiento,
                estado: 'activo',
                nota: dto.nota,
            })
            .select()
            .single();

        if (prestamoError) {
            console.error('Error al crear préstamo:', prestamoError);
            return { success: false, error: 'Error al crear préstamo' };
        }

        // Crear movimiento de desembolso inicial
        const { error: movimientoError } = await supabase
            .from('movimientos_prestamo')
            .insert({
                prestamo_id: prestamo.id,
                tipo: 'registro_desembolso', // Changed from 'desembolso' to avoid double counting in View
                monto: dto.monto_desembolsado,
                nota: 'Desembolso inicial',
            });

        if (movimientoError) {
            console.error('Error al crear movimiento de desembolso:', movimientoError);
            // No retornar error porque el préstamo ya se creó
        }

        return { success: true, data: prestamo };
    } catch (error) {
        console.error('Error en createLoan:', error);
        return { success: false, error: 'Error al crear préstamo' };
    }
}

/**
 * Obtener préstamos de un cliente específico
 * @param userId ID del usuario
 * @returns Lista de préstamos del cliente
 */
export async function getClientLoans(
    userId: number
): Promise<LoanServiceResponse<Prestamo[]>> {
    try {
        const { data, error } = await supabase
            .from('prestamos')
            .select('*')
            .eq('usuario_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error al obtener préstamos del cliente:', error);
            return { success: false, error: 'Error al obtener préstamos' };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error en getClientLoans:', error);
        return { success: false, error: 'Error al obtener préstamos' };
    }
}

/**
 * Obtener todos los préstamos (solo admin)
 * @returns Lista de todos los préstamos
 */
export async function getAllLoans(): Promise<LoanServiceResponse<Prestamo[]>> {
    try {
        const { data, error } = await supabase
            .from('prestamos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error al obtener préstamos:', error);
            return { success: false, error: 'Error al obtener préstamos' };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error en getAllLoans:', error);
        return { success: false, error: 'Error al obtener préstamos' };
    }
}

/**
 * Obtener saldo de un préstamo específico usando la vista
 * @param loanId ID del préstamo
 * @returns Saldo del préstamo
 */
export async function getLoanBalance(
    loanId: number
): Promise<LoanServiceResponse<number>> {
    try {
        const { data, error } = await supabase
            .from('v_saldo_prestamos')
            .select('saldo')
            .eq('prestamo_id', loanId)
            .single();

        if (error) {
            console.error('Error al obtener saldo del préstamo:', error);
            return { success: false, error: 'Error al obtener saldo' };
        }

        return { success: true, data: data?.saldo || 0 };
    } catch (error) {
        console.error('Error en getLoanBalance:', error);
        return { success: false, error: 'Error al obtener saldo' };
    }
}

/**
 * Obtener préstamos con sus saldos
 * @param userId ID del usuario (opcional, para filtrar)
 * @returns Lista de préstamos con saldos
 */
export async function getLoansWithBalances(
    userId?: number
): Promise<LoanServiceResponse<PrestamoConSaldo[]>> {
    try {
        // Obtener préstamos
        let query = supabase
            .from('prestamos')
            .select('*')
            .order('created_at', { ascending: false });

        if (userId) {
            query = query.eq('usuario_id', userId);
        }

        const { data: prestamos, error: prestamosError } = await query;

        if (prestamosError) {
            console.error('Error al obtener préstamos:', prestamosError);
            return { success: false, error: 'Error al obtener préstamos' };
        }

        if (!prestamos || prestamos.length === 0) {
            return { success: true, data: [] };
        }

        // Obtener saldos de la vista
        const prestamoIds = prestamos.map((p) => p.id);
        const { data: saldos, error: saldosError } = await supabase
            .from('v_saldo_prestamos')
            .select('*')
            .in('prestamo_id', prestamoIds);

        if (saldosError) {
            console.error('Error al obtener saldos:', saldosError);
            // Continuar sin saldos
        }

        // Combinar préstamos con saldos
        const prestamosConSaldo: PrestamoConSaldo[] = prestamos.map((prestamo) => {
            const saldo = saldos?.find((s) => s.prestamo_id === prestamo.id);
            return {
                ...prestamo,
                saldo: saldo?.saldo || 0,
            };
        });

        return { success: true, data: prestamosConSaldo };
    } catch (error) {
        console.error('Error en getLoansWithBalances:', error);
        return { success: false, error: 'Error al obtener préstamos con saldos' };
    }
}

/**
 * Actualizar estado de un préstamo
 * @param loanId ID del préstamo
 * @param estado Nuevo estado
 * @returns Préstamo actualizado
 */
export async function updateLoanStatus(
    loanId: number,
    estado: 'activo' | 'cerrado' | 'en_mora' | 'perdonado'
): Promise<LoanServiceResponse<Prestamo>> {
    try {
        const { data, error } = await supabase
            .from('prestamos')
            .update({ estado })
            .eq('id', loanId)
            .select()
            .single();

        if (error) {
            console.error('Error al actualizar estado del préstamo:', error);
            return { success: false, error: 'Error al actualizar préstamo' };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error en updateLoanStatus:', error);
        return { success: false, error: 'Error al actualizar préstamo' };
    }
}
