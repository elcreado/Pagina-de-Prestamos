// "use client";

// import { useState } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { Input } from "@/components/ui/Input";
// import { Button } from "@/components/ui/Button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

// export default function LoginPage() {
//     const { login } = useAuth();
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError("");

//         if (!username || !password) {
//             setError("Por favor completa todos los campos");
//             return;
//         }

//         const result = await login(username, password);
//         if (!result.success) {
//             setError(result.error || "Credenciales inválidas");
//         }
//         // Si el login es exitoso, el AuthContext ya maneja la redirección
//     };

//     return (
//         <div className="flex min-h-screen
//         items-center
//         justify-center
//         bg-zinc-900
//         p-4">
//             <Card className="w-full max-w-sm
//             border-emerald-500/30
//             bg-zinc-800
//             shadow-2xl
//             backdrop-blur-xl">
//                 <CardHeader className="space-y-1 text-center">
//                     <CardTitle className="text-2xl
//                     font-light
//                     tracking-widest
//                     text-emerald-400">
//                         ACCESO
//                     </CardTitle>
//                     <CardDescription className="text-zinc-400">
//                         Ingrese sus credenciales para continuar
//                     </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div className="space-y-2">
//                             <Input
//                                 type="text"
//                                 placeholder="Usuario"
//                                 value={username}
//                                 onChange={(e) => setUsername(e.target.value)}
//                                 className="border-zinc-700
//                                 bg-zinc-900/50
//                                 text-emerald-10
//                                 placeholder:text-zinc-500
//                                 focus-visible:ring-emerald-500/50"
//                             />
//                         </div>
//                         <div className="space-y-2">
//                             <Input
//                                 type="password"
//                                 placeholder="Contraseña"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 className="border-zinc-700
//                                 bg-zinc-900/50
//                                 text-emerald-100
//                                 placeholder:text-zinc-500
//                                 focus-visible:ring-emerald-500/50"
//                             />
//                         </div>
//                         {error && (
//                             <div className="text-center
//                             text-xs
//                             text-red-400
//                             animate-pulse">
//                                 {error}
//                             </div>
//                         )}
//                         <Button
//                             type="submit"
//                             className="w-full bg-emerald-500/20
//                             text-emerald-400
//                             hover:bg-emerald-500/30
//                             hover:text-emerald-300
//                             border border-emerald-500/30
//                             transition-all duration-300"
//                         >
//                             INGRESAR
//                         </Button>
//                     </form>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }
