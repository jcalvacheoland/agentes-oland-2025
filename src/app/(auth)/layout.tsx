import type { ReactNode } from "react";
import "../globals.css";
import { Header } from "./components/Header";
import { BackgroundImg } from "./components/BackgroundImg";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <BackgroundImg />
      <Header />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
