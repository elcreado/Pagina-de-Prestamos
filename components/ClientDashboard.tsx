"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import * as loansService from "@/lib/services/loans.service";
import * as paymentsService from "@/lib/services/payments.service";
import { PrestamoConSaldo, MovimientoPrestamo } from "@/types/database.types";

export default function ClientDashboard() {
    const { logout, user } = useAuth();
    const [prestamos, setPrestamos] = useState<PrestamoConSaldo[]>([]);
    const [movimientos, setMovimientos] = useState<MovimientoPrestamo[]>([]);
    const [loading, setLoading] = useState(true);

    // Estado para pago
    const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMessage, setPaymentMessage] = useState("");

    useEffect(() => {
        if (user?.id) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        if (!user?.id) return;

        setLoading(true);

        // Cargar préstamos con saldos
        const loansResponse = await loansService.getLoansWithBalances(user.id);
        if (loansResponse.success && loansResponse.data) {
            setPrestamos(loansResponse.data);
        }

        // Cargar movimientos
        const movementsResponse = await paymentsService.getUserPayments(user.id);
        if (movementsResponse.success && movementsResponse.data) {
            setMovimientos(movementsResponse.data);
        }

        setLoading(false);
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setPaymentMessage("");

        if (!selectedLoanId || !paymentAmount) {
            setPaymentMessage("❌ Por favor complete todos los campos");
            return;
        }

        const response = await paymentsService.createPayment({
            prestamo_id: selectedLoanId,
            monto: parseFloat(paymentAmount),
        });

        if (response.success) {
            setPaymentMessage("✅ Pago registrado exitosamente");
            setPaymentAmount("");
            setSelectedLoanId(null);
            loadData(); // Recargar datos
        } else {
            setPaymentMessage(`❌ ${response.error}`);
        }
    };

    const totalDebt = prestamos
        .filter(p => p.estado === 'activo')
        .reduce((sum, p) => sum + p.saldo, 0);

    if (loading) {
        return (
            <div className="min-h-screen 
            bg-gray-900 
            text-gray-100 
            p-8 
            flex 
            items-center 
            justify-center">
                <p className="text-emerald-400">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen 
        bg-zinc-900 
        text-zinc-100 
        p-8">
            <div className="max-w-4xl 
            mx-auto 
            space-y-8">
                <header className="flex 
                justify-between 
                items-center 
                bg-zinc-800/50 
                p-6 
                rounded-2xl 
                border 
                border-zinc-700/50 
                backdrop-blur-sm">
                    <div>
                        <h1 className="text-3xl 
                        font-light 
                        tracking-wide 
                        text-white">
                            Mis <span className="text-emerald-400 font-normal">Finanzas</span>
                        </h1>
                        <p className="text-zinc-400 mt-1">Bienvenido, {user?.nombre_completo}</p>
                    </div>
                    <Button
                        onClick={logout}
                        variant="outline"
                        className="border-red-500/30 
                        text-red-400 
                        hover:bg-red-500/10 
                        hover:text-red-300"
                    >
                        Salir
                    </Button>
                </header>

                {/* Total Summary */}
                <Card className="bg-gradient-to-br 
                from-emerald-900/20 
                to-zinc-800/50 
                border-emerald-500/20 
                border">
                    <CardHeader className="text-center pb-2">
                        <CardDescription className="text-emerald-200/70 
                        uppercase 
                        tracking-widest 
                        text-xs">Deuda Total Pendiente</CardDescription>
                        <CardTitle className="text-5xl 
                        font-thin 
                        text-white 
                        mt-2">
                            ${totalDebt.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center pb-6">
                        {totalDebt > 0 ? (
                            <span className="inline-block w-2 h-2 
                            rounded-full 
                            bg-red-400 
                            animate-pulse 
                            mr-2 
                            mb-1"></span>
                        ) : (
                            <span className="inline-block w-2 h-2 
                            rounded-full 
                            bg-emerald-400 
                            mr-2 
                            mb-1"></span>
                        )}
                        <span className="text-sm text-zinc-400">
                            {totalDebt > 0 ? "Tienes pagos pendientes" : "Estás al día"}
                        </span>
                    </CardContent>
                </Card>

                {/* Realizar Pago */}
                <Card className="bg-zinc-800 
                border-zinc-700/50 
                border">
                    <CardHeader>
                        <CardTitle className="text-xl 
                        font-light 
                        text-emerald-300">Realizar Pago</CardTitle>
                        <CardDescription className="text-zinc-500">Registra un pago a tu préstamo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePayment} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400">Préstamo</label>
                                <select
                                    value={selectedLoanId || ""}
                                    onChange={(e) => setSelectedLoanId(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-3 py-2 
                                    rounded-md 
                                    bg-zinc-900/50 
                                    border 
                                    border-zinc-700 
                                    text-white 
                                    focus:ring-2 
                                    focus:ring-emerald-500/50"
                                    required
                                >
                                    <option value="">Seleccionar préstamo...</option>
                                    {prestamos.filter(p => p.estado === 'activo' && p.saldo > 0).map((p) => (
                                        <option key={p.id} value={p.id}>
                                            Préstamo #{p.id} - Saldo: ${p.saldo.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400">Monto a Pagar</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="bg-zinc-900/50 
                                    border-zinc-700 
                                    focus-visible:ring-emerald-500/50"
                                    required
                                />
                                {selectedLoanId && (
                                    <p className="text-xs text-zinc-500">
                                        Saldo actual: ${prestamos.find(p => p.id === selectedLoanId)?.saldo.toFixed(2)}
                                    </p>
                                )}
                            </div>
                            {paymentMessage && (
                                <p className="text-sm text-center">{paymentMessage}</p>
                            )}
                            <Button
                                type="submit"
                                className="w-full bg-emerald-500 
                                hover:bg-emerald-600 
                                text-emerald-950 
                                font-medium"
                            >
                                Realizar Pago
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Mis Préstamos */}
                <div className="space-y-4">
                    <h2 className="text-xl 
                    font-light 
                    text-zinc-300 
                    pl-2">Mis Préstamos</h2>
                    {prestamos.length === 0 ? (
                        <Card className="bg-zinc-800/30 
                        border-dashed 
                        border-zinc-700 
                        p-8 
                        text-center 
                        text-zinc-500">
                            No tienes préstamos registrados.
                        </Card>
                    ) : (
                        prestamos.map((prestamo) => (
                            <Card key={prestamo.id} className="bg-zinc-800 
                            border-zinc-700/50 
                            hover:bg-zinc-800/80 
                            transition-all">
                                <CardContent className="p-6">
                                    <div className="flex justify-between 
                                    items-start 
                                    mb-4">
                                        <div>
                                            <h3 className="text-lg 
                                            font-medium 
                                            text-white">Préstamo #{prestamo.id}</h3>
                                            <p className="text-sm 
                                            text-zinc-400">
                                                Monto original: ${prestamo.monto_desembolsado.toFixed(2)} {prestamo.moneda}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-3 
                                        py-1 
                                        rounded-full 
                                        border ${prestamo.estado === 'cerrado'
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : prestamo.estado === 'perdonado'
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    : prestamo.estado === 'en_mora'
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                            }`}>
                                            {prestamo.estado === 'cerrado'
                                                ? 'Pagado'
                                                : prestamo.estado === 'perdonado'
                                                    ? 'Condonado'
                                                    : prestamo.estado === 'en_mora'
                                                        ? 'En mora'
                                                        : 'Activo'}
                                        </span>
                                    </div>

                                    <div className="bg-zinc-900/40 
                                    rounded-lg 
                                    p-4 
                                    space-y-2">
                                        <div className="flex justify-between 
                                        text-sm">
                                            <span className="text-zinc-400">Saldo actual:</span>
                                            <span className="text-emerald-400 
                                            font-medium 
                                            text-lg">
                                                ${prestamo.saldo.toFixed(2)} {prestamo.moneda}
                                            </span>
                                        </div>
                                        <div className="flex justify-between 
                                        text-xs 
                                        text-zinc-500">
                                            <span>Tasa mensual: {(prestamo.tasa_interes_mensual * 100).toFixed(2)}%</span>
                                            <span>Inicio: {new Date(prestamo.fecha_inicio).toLocaleDateString()}</span>
                                        </div>
                                        {prestamo.nota && (
                                            <p className="text-xs 
                                            text-zinc-500 
                                            italic 
                                            mt-2">{prestamo.nota}</p>
                                        )}
                                    </div>

                                    {/* Progreso de pago */}
                                    {prestamo.estado === 'activo' && (
                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                                <span>Progreso de pago</span>
                                                <span>
                                                    {((1 - prestamo.saldo / prestamo.monto_desembolsado) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-zinc-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r 
                                                    from-emerald-500 
                                                    to-emerald-400 
                                                    h-2 
                                                    rounded-full 
                                                    transition-all"
                                                    style={{ width: `${Math.min(100, (1 - prestamo.saldo / prestamo.monto_desembolsado) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Historial de Movimientos */}
                {movimientos.length > 0 && (
                    <Card className="bg-zinc-800 border-zinc-700/50">
                        <CardHeader>
                            <CardTitle className="text-xl font-light text-emerald-300">Historial de Movimientos</CardTitle>
                            <CardDescription className="text-zinc-500">Últimos pagos y transacciones</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
                            {movimientos.slice(0, 10).map((mov) => (
                                <div
                                    key={mov.id}
                                    className="flex justify-between items-center p-3 rounded-lg bg-zinc-900/40 border border-zinc-800"
                                >
                                    <div>
                                        <p className={`font-medium ${mov.tipo === 'pago' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                            {mov.tipo === 'pago' ? '-' : '+'}${mov.monto.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-zinc-500 capitalize">
                                            {mov.tipo === 'registro_desembolso' ? 'Desembolso' : mov.tipo}
                                        </p>
                                        {mov.nota && <p className="text-xs text-zinc-600 italic">{mov.nota}</p>}
                                    </div>
                                    <div className="text-right text-xs text-zinc-500">
                                        <p>{new Date(mov.fecha).toLocaleDateString()}</p>
                                        <p>{new Date(mov.fecha).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
