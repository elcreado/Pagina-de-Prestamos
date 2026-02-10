"use client";

import { useAuth } from "@/context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import ClientDashboard from "./ClientDashboard";

export default function Dashboard() {
    const { user } = useAuth();

    if (user?.role === "admin") {
        return <AdminDashboard />;
    }

    if (user?.role === "cliente") {
        return <ClientDashboard />;
    }

    return null;
}
