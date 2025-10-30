"use client"
import type { ReactNode } from "react";
import "../globals.css";
import { Toaster } from "react-hot-toast";
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
         <Toaster position="top-center" />
        </main>
        </SessionProvider>
     
    </div>
     
    </>
  );
}
