"use client"
import type { ReactNode } from "react";
import "../globals.css";
import { HeaderUser } from "./dashboard/components/header";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {

  
  return (
    <>
    <div >
       <HeaderUser  />
      <main >{children}</main>
    </div>
     
    </>
  );
}
