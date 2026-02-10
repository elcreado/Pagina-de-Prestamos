// ==================================================================
// Authentication Service - Manejo de autenticación con Supabase
// ==================================================================

import { supabase } from '../supabaseClient';
import { Usuario } from '@/types/database.types';
import { comparePassword } from '@/utils/password';

export interface AuthResponse {
    success: boolean;
    user?: Omit<Usuario, 'password_hash'>;
    error?: string;
}

/**
 * Login con username y password
 * @param username Username del usuario
 * @param password Contraseña en texto plano
 * @returns Usuario si las credenciales son válidas
 */
export async function login(
    username: string,
    password: string
): Promise<AuthResponse> {
    try {
        // Buscar usuario por username
        const { data: usuarios, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('username', username)
            .eq('is_active', true)
            .single();

        if (error || !usuarios) {
            return {
                success: false,
                error: 'Usuario o contraseña incorrectos',
            };
        }

        // Verificar contraseña
        const passwordMatch = await comparePassword(password, usuarios.password_hash);

        if (!passwordMatch) {
            return {
                success: false,
                error: 'Usuario o contraseña incorrectos',
            };
        }

        // Establecer el user_id en la sesión para RLS
        await supabase.rpc('set_current_user_id', { user_id: usuarios.id });

        // Remover password_hash antes de retornar
        const { password_hash, ...userWithoutPassword } = usuarios;

        return {
            success: true,
            user: userWithoutPassword,
        };
    } catch (error) {
        console.error('Error en login:', error);
        return {
            success: false,
            error: 'Error al intentar iniciar sesión',
        };
    }
}

/**
 * Obtener usuario actual desde localStorage
 * @returns Usuario actual o null
 */
export function getCurrentUser(): Omit<Usuario, 'password_hash'> | null {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem('current_user');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

/**
 * Guardar usuario en localStorage
 * @param user Usuario a guardar
 */
export function saveCurrentUser(user: Omit<Usuario, 'password_hash'>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('current_user', JSON.stringify(user));
}

/**
 * Cerrar sesión
 */
export function logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('current_user');
}

/**
 * Verificar si el usuario es admin
 * @param user Usuario a verificar
 * @returns true si es admin
 */
export function isAdmin(user: Omit<Usuario, 'password_hash'> | null): boolean {
    return user?.role === 'admin';
}
