"use client";

import { AuthProvider, useAuth } from "@/context/AuthContext";

import MainPage from "@/app/main/page";
import LoginPage from "@/app/login/page";

function MainContent() {
  const { user } = useAuth();
  return user ? <MainPage /> : <LoginPage />;
}

export default function Home() {
  return (
    <AuthProvider>
      <MainPage />
    </AuthProvider>
  );
}