// ==================================================================
// Database Types - Interfaces TypeScript para las tablas de Supabase
// ==================================================================

export interface Usuario {
    id: number;
    nombre_completo: string;
    username: string;
    password_hash: string;
    role: 'admin' | 'cliente';
    is_active: boolean;
    created_by: number | null;
    created_at: string;
    updated_at: string;
}

export interface Prestamo {
    id: number;
    usuario_id: number;
    moneda: string;
    monto_desembolsado: number;
    tasa_interes_mensual: number;
    fecha_inicio: string;
    fecha_vencimiento: string | null;
    estado: 'activo' | 'cerrado' | 'en_mora' | 'perdonado';
    nota: string | null;
    created_at: string;
}

export interface MovimientoPrestamo {
    id: number;
    prestamo_id: number;
    // 'registro_desembolso' is used instead of 'desembolso' to avoid double counting in v_saldo_prestamos
    tipo: 'desembolso' | 'registro_desembolso' | 'pago' | 'interes' | 'cargo' | 'ajuste';
    monto: number;
    fecha: string;
    nota: string | null;
    referencia: string | null;
}

export interface SaldoPrestamo {
    prestamo_id: number;
    usuario_id: number;
    moneda: string;
    saldo: number;
}

// ==================================================================
// DTOs - Data Transfer Objects
// ==================================================================

export interface CreateUsuarioDTO {
    nombre_completo: string;
    username: string;
    password: string; // Plain password, will be hashed
    role: 'admin' | 'cliente';
    created_by?: number;
}

export interface CreatePrestamoDTO {
    usuario_id: number;
    moneda?: string;
    monto_desembolsado: number;
    tasa_interes_mensual?: number;
    fecha_inicio?: string;
    fecha_vencimiento?: string | null;
    nota?: string | null;
}

export interface CreatePagoDTO {
    prestamo_id: number;
    monto: number;
    nota?: string;
    referencia?: string;
}

export interface CreateAjusteDTO {
    prestamo_id: number;
    monto: number;
    nota?: string;
}

// ==================================================================
// Extended Types - Con relaciones
// ==================================================================

export interface PrestamoConSaldo extends Prestamo {
    saldo: number;
}

export interface PrestamoConUsuario extends Prestamo {
    usuario: Pick<Usuario, 'id' | 'nombre_completo' | 'username'>;
}

export interface MovimientoConPrestamo extends MovimientoPrestamo {
    prestamo: Pick<Prestamo, 'id' | 'usuario_id' | 'moneda'>;
}
