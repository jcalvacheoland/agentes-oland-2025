"use client"
import type { ReactNode } from "react";
import "../globals.css";
import { HeaderUser } from "./dashboard/components/header";
import { SessionProvider } from "next-auth/react";
type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {

  
  return (
    <>
    <div >
       <SessionProvider>
       <HeaderUser  />
        <main>
        {children}
        </main>
        </SessionProvider>
     
    </div>
     
    </>
  );
}
