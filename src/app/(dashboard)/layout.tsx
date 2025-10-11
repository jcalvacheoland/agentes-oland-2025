"use client"
import type { ReactNode } from "react";
import "../globals.css";
import { HeaderUser } from "./dashboard/components/header";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {

  const handleLogout = () => {
    localStorage.removeItem("bitrixUser");
    window.location.href = "/"; // o una ruta de login
  };
  return (
    <>
    <div >
       <HeaderUser onLogout={handleLogout} />
      <main >{children}</main>
    </div>
     
    </>
  );
}
