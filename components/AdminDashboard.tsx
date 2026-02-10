"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import * as usersService from "@/lib/services/users.service";
import * as loansService from "@/lib/services/loans.service";
import { CreateUsuarioDTO, CreatePrestamoDTO, PrestamoConSaldo, MovimientoPrestamo } from "@/types/database.types";
import { Usuario } from "@/types/database.types";
import * as adminMovementsService from "@/lib/services/admin-movements.service";

export default function AdminDashboard() {
    const { logout, user } = useAuth();

    // Estado para registro de usuario
    const [newUser, setNewUser] = useState({
        nombre_completo: "",
        username: "",
        password: "",
        role: "cliente" as "admin" | "cliente",
    });
    const [userMessage, setUserMessage] = useState("");

    // Estado para nuevo préstamo
    const [newLoan, setNewLoan] = useState({
        usuario_id: "",
        monto_desembolsado: "",
        tasa_interes_mensual: "0.035",
    });
    const [loanMessage, setLoanMessage] = useState("");

    // Estado para listados
    const [usuarios, setUsuarios] = useState<Omit<Usuario, 'password_hash'>[]>([]);
    const [prestamos, setPrestamos] = useState<PrestamoConSaldo[]>([]);
    const [loading, setLoading] = useState(true);

    // Estado para movimientos de préstamos
    const [expandedLoanId, setExpandedLoanId] = useState<number | null>(null);
    const [loanMovements, setLoanMovements] = useState<Record<number, MovimientoPrestamo[]>>({});
    const [loadingMovements, setLoadingMovements] = useState<Record<number, boolean>>({});

    // Cargar datos
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);

        // Cargar usuarios
        const usersResponse = await usersService.getAllUsers();
        if (usersResponse.success && usersResponse.data) {
            setUsuarios(usersResponse.data);
        }

        // Cargar préstamos con saldos
        const loansResponse = await loansService.getLoansWithBalances();
        if (loansResponse.success && loansResponse.data) {
            setPrestamos(loansResponse.data);
        }

        setLoading(false);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setUserMessage("");

        if (!user?.id) return;

        const response = await usersService.createUser(newUser, user.id);

        if (response.success) {
            setUserMessage("✅ Usuario creado exitosamente");
            setNewUser({ nombre_completo: "", username: "", password: "", role: "cliente" });
            loadData(); // Recargar datos
        } else {
            setUserMessage(`❌ ${response.error}`);
        }
    };

    const handleCreateLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoanMessage("");

        const loanData: CreatePrestamoDTO = {
            usuario_id: parseInt(newLoan.usuario_id),
            monto_desembolsado: parseFloat(newLoan.monto_desembolsado),
            tasa_interes_mensual: parseFloat(newLoan.tasa_interes_mensual),
        };

        const response = await loansService.createLoan(loanData);

        if (response.success) {
            setLoanMessage("✅ Préstamo creado exitosamente");
            setNewLoan({ usuario_id: "", monto_desembolsado: "", tasa_interes_mensual: "0.035" });
            loadData(); // Recargar datos
        } else {
            setLoanMessage(`❌ ${response.error}`);
        }
    };

    const toggleLoanMovements = async (loanId: number) => {
        if (expandedLoanId === loanId) {
            setExpandedLoanId(null);
            return;
        }

        setExpandedLoanId(loanId);

        // Load movements if not already loaded
        if (!loanMovements[loanId]) {
            setLoadingMovements({ ...loadingMovements, [loanId]: true });
            const response = await adminMovementsService.getLoanMovements(loanId);
            if (response.success && response.data) {
                setLoanMovements({ ...loanMovements, [loanId]: response.data });
            }
            setLoadingMovements({ ...loadingMovements, [loanId]: false });
        }
    };

    const handleForgiveLoanDebt = async (loanId: number, usuarioNombre: string) => {
        const confirmacion = confirm(
            `¿Está seguro de eliminar la deuda del préstamo de ${usuarioNombre}? Esta acción no se puede deshacer.`
        );

        if (!confirmacion) return;

        const response = await adminMovementsService.forgiveLoanDebt(
            loanId,
            `Deuda eliminada por administrador`
        );

        if (response.success) {
            alert('✅ Deuda eliminada exitosamente');
            loadData(); // Reload all data
            // Reload movements for this loan if expanded
            if (expandedLoanId === loanId) {
                const movResponse = await adminMovementsService.getLoanMovements(loanId);
                if (movResponse.success && movResponse.data) {
                    setLoanMovements({ ...loanMovements, [loanId]: movResponse.data });
                }
            }
        } else {
            alert(`❌ ${response.error}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex items-center justify-center">
                <p className="text-emerald-400">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-zinc-100 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-center bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700/50 backdrop-blur-sm">
                    <div>
                        <h1 className="text-3xl font-light tracking-wide text-white">
                            Panel <span className="text-emerald-400 font-normal">Administrador</span>
                        </h1>
                        <p className="text-zinc-400 mt-1">Gestión de préstamos y usuarios</p>
                    </div>
                    <Button
                        onClick={logout}
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                        Salir
                    </Button>
                </header>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Registrar Usuario */}
                    <Card className="bg-zinc-800 border-zinc-700/50 border">
                        <CardHeader>
                            <CardTitle className="text-xl font-light text-emerald-300">Registrar Usuario</CardTitle>
                            <CardDescription className="text-zinc-500">Crear nuevo cliente o administrador</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Nombre Completo</label>
                                    <Input
                                        type="text"
                                        value={newUser.nombre_completo}
                                        onChange={(e) => setNewUser({ ...newUser, nombre_completo: e.target.value })}
                                        className="bg-zinc-900/50 border-zinc-700 focus-visible:ring-emerald-500/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Username</label>
                                    <Input
                                        type="text"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        className="bg-zinc-900/50 border-zinc-700 focus-visible:ring-emerald-500/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Contraseña</label>
                                    <Input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="bg-zinc-900/50 border-zinc-700 focus-visible:ring-emerald-500/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Rol</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "admin" | "cliente" })}
                                        className="w-full px-3 py-2 rounded-md bg-zinc-900/50 border border-zinc-700 text-white focus:ring-2 focus:ring-emerald-500/50"
                                    >
                                        <option value="cliente">Cliente</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                {userMessage && (
                                    <p className="text-sm text-center">{userMessage}</p>
                                )}
                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-medium"
                                >
                                    Crear Usuario
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Nuevo Préstamo */}
                    <Card className="bg-zinc-800 border-zinc-700/50 border">
                        <CardHeader>
                            <CardTitle className="text-xl font-light text-emerald-300">Nuevo Préstamo</CardTitle>
                            <CardDescription className="text-zinc-500">Asignar préstamo a usuario</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateLoan} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Usuario</label>
                                    <select
                                        value={newLoan.usuario_id}
                                        onChange={(e) => setNewLoan({ ...newLoan, usuario_id: e.target.value })}
                                        className="w-full px-3 py-2 rounded-md bg-zinc-900/50 border border-zinc-700 text-white focus:ring-2 focus:ring-emerald-500/50"
                                        required
                                    >
                                        <option value="">Seleccionar usuario...</option>
                                        {usuarios.filter(u => u.role === 'cliente').map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.nombre_completo} (@{u.username})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Monto (COP)</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={newLoan.monto_desembolsado}
                                        onChange={(e) => setNewLoan({ ...newLoan, monto_desembolsado: e.target.value })}
                                        className="bg-zinc-900/50 border-zinc-700 focus-visible:ring-emerald-500/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Tasa Interés Mensual (decimal)</label>
                                    <Input
                                        type="number"
                                        step="0.0001"
                                        value={newLoan.tasa_interes_mensual}
                                        onChange={(e) => setNewLoan({ ...newLoan, tasa_interes_mensual: e.target.value })}
                                        className="bg-zinc-900/50 border-zinc-700 focus-visible:ring-emerald-500/50"
                                    />
                                    <p className="text-xs text-zinc-500">Ej: 0.035 = 3.5%</p>
                                </div>
                                {loanMessage && (
                                    <p className="text-sm text-center">{loanMessage}</p>
                                )}
                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-medium"
                                >
                                    Crear Préstamo
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Préstamos Activos */}
                <Card className="bg-zinc-800 border-zinc-700/50 border">
                    <CardHeader>
                        <CardTitle className="text-xl font-light text-emerald-300">Préstamos Activos</CardTitle>
                        <CardDescription className="text-zinc-500">Todos los préstamos del sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {prestamos.length === 0 ? (
                            <p className="text-center text-zinc-600 py-8 italic">No hay préstamos registrados</p>
                        ) : (
                            prestamos.map((prestamo) => {
                                const usuario = usuarios.find(u => u.id === prestamo.usuario_id);
                                const isExpanded = expandedLoanId === prestamo.id;
                                const movements = loanMovements[prestamo.id] || [];
                                const isLoadingMov = loadingMovements[prestamo.id];

                                return (
                                    <div key={prestamo.id} className="rounded-lg bg-zinc-900/40 border border-zinc-800">
                                        <div className="flex justify-between items-start p-4">
                                            <div className="flex-1">
                                                <p className="font-medium text-white">
                                                    {usuario?.nombre_completo || 'Usuario desconocido'}
                                                </p>
                                                <p className="text-sm text-zinc-400">
                                                    Monto original: ${prestamo.monto_desembolsado.toFixed(2)} {prestamo.moneda}
                                                </p>
                                                <p className="text-sm text-emerald-400">
                                                    Saldo actual: ${prestamo.saldo.toFixed(2)} {prestamo.moneda}
                                                </p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${prestamo.estado === 'cerrado'
                                                    ? 'bg-green-500/10 text-green-400'
                                                    : prestamo.estado === 'perdonado'
                                                        ? 'bg-blue-500/10 text-blue-400'
                                                        : prestamo.estado === 'en_mora'
                                                            ? 'bg-red-500/10 text-red-400'
                                                            : 'bg-yellow-500/10 text-yellow-400'
                                                    }`}>
                                                    {prestamo.estado === 'perdonado' ? 'Condonado' : prestamo.estado === 'cerrado' ? 'Pagado' : prestamo.estado}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-2 items-end">
                                                <div className="text-right text-sm text-zinc-500">
                                                    <p>Tasa: {(prestamo.tasa_interes_mensual * 100).toFixed(2)}%</p>
                                                    <p>Inicio: {new Date(prestamo.fecha_inicio).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => toggleLoanMovements(prestamo.id)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs"
                                                    >
                                                        {isExpanded ? 'Ocultar' : 'Ver Movimientos'}
                                                    </Button>
                                                    {prestamo.estado === 'activo' && prestamo.saldo > 0 && (
                                                        <Button
                                                            onClick={() => handleForgiveLoanDebt(prestamo.id, usuario?.nombre_completo || 'Usuario')}
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                                                        >
                                                            Eliminar Deuda
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expandable movements section */}
                                        {isExpanded && (
                                            <div className="border-t border-zinc-800 p-4 bg-zinc-950/30">
                                                <h4 className="text-sm font-medium text-emerald-300 mb-3">Historial de Movimientos</h4>
                                                {isLoadingMov ? (
                                                    <p className="text-sm text-zinc-500 text-center py-4">Cargando...</p>
                                                ) : movements.length === 0 ? (
                                                    <p className="text-sm text-zinc-500 text-center py-4">No hay movimientos</p>
                                                ) : (
                                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                                        {movements.map((mov) => (
                                                            <div
                                                                key={mov.id}
                                                                className="flex justify-between items-center p-3 rounded bg-zinc-900/50 border border-zinc-800"
                                                            >
                                                                <div>
                                                                    <p className={`font-medium text-sm ${mov.tipo === 'pago' ? 'text-emerald-400' :
                                                                        (mov.tipo === 'desembolso' || mov.tipo === 'registro_desembolso') ? 'text-blue-400' :
                                                                            mov.tipo === 'ajuste' ? 'text-orange-400' :
                                                                                'text-yellow-400'
                                                                        }`}>
                                                                        {mov.tipo === 'pago' ? '-' : '+'}${mov.monto.toFixed(2)}
                                                                    </p>
                                                                    <p className="text-xs text-zinc-500 capitalize">
                                                                        {mov.tipo === 'registro_desembolso' ? 'Desembolso' : mov.tipo}
                                                                    </p>
                                                                    {mov.nota && <p className="text-xs text-zinc-600 italic mt-1">{mov.nota}</p>}
                                                                </div>
                                                                <div className="text-right text-xs text-zinc-500">
                                                                    <p>{new Date(mov.fecha).toLocaleDateString()}</p>
                                                                    <p>{new Date(mov.fecha).toLocaleTimeString()}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
