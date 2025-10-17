"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

import { usePathname } from "next/navigation";
import { UsuarioIcon } from "@/components/icons/Usuario";
import { useBitrixUser } from "@/hooks/useBitrixUser";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Menu, Settings, LogOut, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";



const navLinks = [
  { href: "/inicio", label: "Inicio", match: "/inicio" },
  { href: "/dashboard", label: "Mis cotizaciones", match: "/dashboard" },
];

export const HeaderUser = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, error } = useBitrixUser();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </header>
    );
  }

  if (error) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertDescription>
              No se pudo cargar el usuario de Bitrix24: {error}
            </AlertDescription>
          </Alert>
        </div>
      </header>
    );
  }

  const handleLogout = async () => {
  setIsSidebarOpen(false);
  await signOut({ callbackUrl: "/login" }); // 🔹 redirige al login automáticamente
};


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo y título */}
        <Link href="/inicio" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <img
            src="/img/agentesLogo.jpg"
            width={48}
            height={48}
            alt="Logo Agentes"
            className="h-auto w-14 rounded-full  shadow-sm"
          />
          <h1 className="text-xl font-bold text-azul-oland-100 sm:text-2xl">
            Agentes
          </h1>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden border p-1 border-azul-oland-100 rounded-full items-center gap-1 lg:flex">
          {navLinks.map(({ href, label, match }) => {
            const isActive = pathname?.startsWith(match);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-azul-oland-100 rounded-full text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                {label}
              </Link>
            );
          })}
          <a
            href="https://oland.bitrix24.com/crm/deal/kanban/category/24/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            CRM
            <ExternalLink className="h-3 w-3" />
          </a>
        </nav>

        {/* Menú de usuario Desktop */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden text-sm font-medium capitalize text-gray-700 lg:inline">
                {user.name}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden rounded-full lg:inline-flex"
                  >
                    <UsuarioIcon width={30} height={30} styles="text-gray-700" />
                    <span className="sr-only">Menú de usuario</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="capitalize">
                    {user.name}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/ajustes" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Ajustes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                     onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <span className="hidden text-sm text-gray-600 lg:inline">
              No conectado a Bitrix24
            </span>
          )}

          {/* Botón de menú móvil */}
          <Sheet open={isSidebarOpen}  onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96">
              <SheetHeader>
                <SheetTitle className="text-left capitalize">
                  {user ? user.name : "Menú"}
                </SheetTitle>
                <SheetDescription className="text-left">
                  Navegación y configuración
                </SheetDescription>
              </SheetHeader>
              
              <nav className="mt-8 flex p-4 flex-col gap-2">
                {navLinks.map(({ href, label, match }) => {
                  const isActive = pathname?.startsWith(match);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-azul-oland-100 text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
                <a
                  href="https://oland.bitrix24.com/crm/deal/kanban/category/24/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  CRM
                  <ExternalLink className="h-4 w-4" />
                </a>
                <div className="my-4 border-t" />
                <Link
                  href="/dashboard/ajustes"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <Settings className="h-4 w-4" />
                  Ajustes
                </Link>
              </nav>

              <div className="absolute bottom-6 left-6 right-6">
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                  
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};