// ==================================================================
// Payments Service - Procesamiento de pagos
// ==================================================================

import { supabase } from '../supabaseClient';
import {
    MovimientoPrestamo,
    CreatePagoDTO,
} from '@/types/database.types';
import { validatePaymentAmount } from '@/utils/validators';
import { getLoanBalance } from './loans.service';

export interface PaymentServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Crear pago para un préstamo
 * @param dto Datos del pago
 * @returns Movimiento de pago creado
 */
export async function createPayment(
    dto: CreatePagoDTO
): Promise<PaymentServiceResponse<MovimientoPrestamo>> {
    try {
        // Obtener saldo actual del préstamo
        const balanceResponse = await getLoanBalance(dto.prestamo_id);
        if (!balanceResponse.success || balanceResponse.data === undefined) {
            return {
                success: false,
                error: 'Error al obtener saldo del préstamo',
            };
        }

        const currentBalance = balanceResponse.data;

        // Validar monto del pago
        const validation = validatePaymentAmount(dto.monto, currentBalance);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        // Crear movimiento de pago
        const { data, error } = await supabase
            .from('movimientos_prestamo')
            .insert({
                prestamo_id: dto.prestamo_id,
                tipo: 'pago',
                monto: dto.monto,
                nota: dto.nota,
                referencia: dto.referencia,
            })
            .select()
            .single();

        if (error) {
            console.error('Error al crear pago:', error);
            return { success: false, error: 'Error al procesar el pago' };
        }

        // Si el pago cubre el saldo completo, actualizar estado del préstamo
        const newBalance = currentBalance - dto.monto;
        if (newBalance <= 0) {
            await supabase
                .from('prestamos')
                .update({ estado: 'cerrado' })
                .eq('id', dto.prestamo_id);
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error en createPayment:', error);
        return { success: false, error: 'Error al procesar el pago' };
    }
}

/**
 * Obtener historial de movimientos de un préstamo
 * @param loanId ID del préstamo
 * @returns Lista de movimientos
 */
export async function getPaymentHistory(
    loanId: number
): Promise<PaymentServiceResponse<MovimientoPrestamo[]>> {
    try {
        const { data, error } = await supabase
            .from('movimientos_prestamo')
            .select('*')
            .eq('prestamo_id', loanId)
            .order('fecha', { ascending: false });

        if (error) {
            console.error('Error al obtener historial de pagos:', error);
            return { success: false, error: 'Error al obtener historial' };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error en getPaymentHistory:', error);
        return { success: false, error: 'Error al obtener historial' };
    }
}

/**
 * Obtener todos los movimientos de un usuario
 * @param userId ID del usuario
 * @returns Lista de movimientos de todos sus préstamos
 */
export async function getUserPayments(
    userId: number
): Promise<PaymentServiceResponse<MovimientoPrestamo[]>> {
    try {
        // Primero obtener los IDs de préstamos del usuario
        const { data: prestamos, error: prestamosError } = await supabase
            .from('prestamos')
            .select('id')
            .eq('usuario_id', userId);

        if (prestamosError) {
            console.error('Error al obtener préstamos:', prestamosError);
            return { success: false, error: 'Error al obtener movimientos' };
        }

        if (!prestamos || prestamos.length === 0) {
            return { success: true, data: [] };
        }

        const prestamoIds = prestamos.map((p) => p.id);

        // Obtener movimientos de esos préstamos
        const { data, error } = await supabase
            .from('movimientos_prestamo')
            .select('*')
            .in('prestamo_id', prestamoIds)
            .order('fecha', { ascending: false });

        if (error) {
            console.error('Error al obtener movimientos:', error);
            return { success: false, error: 'Error al obtener movimientos' };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error en getUserPayments:', error);
        return { success: false, error: 'Error al obtener movimientos' };
    }
}
