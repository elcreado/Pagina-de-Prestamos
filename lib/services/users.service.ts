// ==================================================================
// Users Service - Gestión de usuarios (solo admin)
// ==================================================================

import { supabase } from '../supabaseClient';
import { Usuario, CreateUsuarioDTO } from '@/types/database.types';
import { hashPassword } from '@/utils/password';
import { validateUsername, validatePassword } from '@/utils/validators';

export interface UserServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Crear nuevo usuario (solo admin)
 * @param dto Datos del nuevo usuario
 * @param createdBy ID del usuario que crea (debe ser admin)
 * @returns Usuario creado
 */
export async function createUser(
    dto: CreateUsuarioDTO,
    createdBy: number
): Promise<UserServiceResponse<Omit<Usuario, 'password_hash'>>> {
    try {
        // Validar username
        const usernameValidation = validateUsername(dto.username);
        if (!usernameValidation.valid) {
            return { success: false, error: usernameValidation.error };
        }

        // Validar password
        const passwordValidation = validatePassword(dto.password);
        if (!passwordValidation.valid) {
            return { success: false, error: passwordValidation.error };
        }

        // Validar nombre completo
        if (!dto.nombre_completo || dto.nombre_completo.trim().length === 0) {
            return { success: false, error: 'El nombre completo es requerido' };
        }

        // Hash de la contraseña
        const password_hash = await hashPassword(dto.password);

        // Insertar usuario
        const { data, error } = await supabase
            .from('usuarios')
            .insert({
                nombre_completo: dto.nombre_completo,
                username: dto.username,
                password_hash,
                role: dto.role,
                created_by: createdBy,
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                // Unique constraint violation
                return { success: false, error: 'El username ya existe' };
            }
            console.error('Error al crear usuario:', error);
            return { success: false, error: 'Error al crear usuario' };
        }

        // Remover password_hash
        const { password_hash: _, ...userWithoutPassword } = data;

        return { success: true, data: userWithoutPassword };
    } catch (error) {
        console.error('Error en createUser:', error);
        return { success: false, error: 'Error al crear usuario' };
    }
}

/**
 * Obtener todos los usuarios (solo admin)
 * @returns Lista de usuarios
 */
export async function getAllUsers(): Promise<
    UserServiceResponse<Omit<Usuario, 'password_hash'>[]>
> {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('id, nombre_completo, username, role, is_active, created_at, updated_at, created_by')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error al obtener usuarios:', error);
            return { success: false, error: 'Error al obtener usuarios' };
        }

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error en getAllUsers:', error);
        return { success: false, error: 'Error al obtener usuarios' };
    }
}

/**
 * Actualizar estado de usuario (activar/desactivar)
 * @param userId ID del usuario
 * @param isActive Nuevo estado
 * @returns Usuario actualizado
 */
export async function updateUserStatus(
    userId: number,
    isActive: boolean
): Promise<UserServiceResponse<Omit<Usuario, 'password_hash'>>> {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .update({ is_active: isActive })
            .eq('id', userId)
            .select('id, nombre_completo, username, role, is_active, created_at, updated_at, created_by')
            .single();

        if (error) {
            console.error('Error al actualizar usuario:', error);
            return { success: false, error: 'Error al actualizar usuario' };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error en updateUserStatus:', error);
        return { success: false, error: 'Error al actualizar usuario' };
    }
}

/**
 * Obtener usuario por ID
 * @param userId ID del usuario
 * @returns Usuario
 */
export async function getUserById(
    userId: number
): Promise<UserServiceResponse<Omit<Usuario, 'password_hash'>>> {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('id, nombre_completo, username, role, is_active, created_at, updated_at, created_by')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error al obtener usuario:', error);
            return { success: false, error: 'Usuario no encontrado' };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error en getUserById:', error);
        return { success: false, error: 'Error al obtener usuario' };
    }
}
