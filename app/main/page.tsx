"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

import { AuthProvider, useAuth } from "@/context/AuthContext";

import LoginPage from "@/app/login/page";

function MainContent() {
    const { user } = useAuth();
    return user ? <MainPage /> : <LoginPage />;
}

export default function MainPage() {
    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
            {/* Navbar Simplificado */}
            <nav className="border-b border-zinc-800/50 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                Préstamos <span className="text-emerald-400 font-light">Calderón</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/login">
                                <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all duration-300">
                                    Iniciar Sesión
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow">
                <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
                    <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full z-0 pointer-events-none">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl opacity-30"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
                            Finanzas Familiares <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
                                Justas y Transparentes
                            </span>
                        </h1>
                        <p className="mt-4 text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Una plataforma diseñada para gestionar préstamos de manera clara, segura y accesible para nuestra comunidad.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/login">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-105">
                                    Acceder a mi Cuenta
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-zinc-800/30 border-y border-zinc-800 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-white mb-4">¿Cómo funciona?</h2>
                            <p className="text-zinc-400 max-w-2xl mx-auto">Nuestro proceso es simple y personal, basado en la confianza y la claridad.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
                            {/* Feature 1 */}
                            <div className="group bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500"></div>
                                <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors duration-300">
                                    <span className="text-2xl">🤝</span>
                                </div>
                                <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-emerald-400 transition-colors">Solicitud Personalizada</h3>
                                <p className="text-zinc-400 leading-relaxed">
                                    Para pedir un préstamo, simplemente acércate a un miembro de la
                                    <span className="text-emerald-300 font-medium"> familia Calderón</span>.
                                    Nosotros procesaremos tu solicitud personalmente y crearemos una cuenta para que puedas gestionar tus pagos de forma digital y segura.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500"></div>
                                <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors duration-300">
                                    <span className="text-2xl">🔍</span>
                                </div>
                                <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-emerald-400 transition-colors">Transparencia Total</h3>
                                <p className="text-zinc-400 leading-relaxed">
                                    Todos los movimientos entre clientes son completamente transparentes.
                                    Podrás ver tu historial de pagos, saldo pendiente y detalles del préstamo en tiempo real desde tu panel de control.
                                    <span className="text-emerald-300 font-medium"> Sin letras pequeñas ni sorpresas.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-zinc-950 border-t border-zinc-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-zinc-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Préstamos Familia Calderón. Todos los derechos reservados.</p>
                    <p className="mt-2 text-zinc-600">Solidaridad y crecimiento para nuestra comunidad.</p>
                </div>
            </footer>
        </div>
    );
}
