"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Usuario } from "@/types/database.types";
import * as authService from "@/lib/services/auth.service";

type Role = "admin" | "cliente";

interface User {
    id: number;
    username: string;
    nombre_completo: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Cargar usuario desde localStorage al montar
    useEffect(() => {
        const savedUser = authService.getCurrentUser();
        if (savedUser) {
            setUser({
                id: savedUser.id,
                username: savedUser.username,
                nombre_completo: savedUser.nombre_completo,
                role: savedUser.role,
            });
        }
        setLoading(false);
    }, []);

    const login = async (username: string, pass: string): Promise<{ success: boolean; error?: string }> => {
        setLoading(true);
        const response = await authService.login(username, pass);

        if (response.success && response.user) {
            const userData = {
                id: response.user.id,
                username: response.user.username,
                nombre_completo: response.user.nombre_completo,
                role: response.user.role,
            };
            setUser(userData);
            authService.saveCurrentUser(response.user);
            setLoading(false);
            return { success: true };
        }

        setLoading(false);
        return { success: false, error: response.error };
    };

    const logout = () => {
        setUser(null);
        authService.logout();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
