"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UsuarioIcon } from '@/components/icons/Usuario';
import { useBitrixUser } from '@/hooks/useBitrixUser';

export const HeaderUser = ({ onLogout }: { onLogout: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, error } = useBitrixUser();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  if (loading) {
    return (
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <p className="text-gray-500">Cargando usuario...</p>
        </div>
      </header>
    );
  }

  if (error) {
    return (
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <p className="text-red-600">No se pudo cargar el usuario de Bitrix24: {error}</p>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <img src="/img/agentesLogo.jpg" width={60} height={60} alt="Logo" className="w-12 h-12 sm:w-15 sm:h-15" />
          <h1 className="text-xl sm:text-3xl font-bold text-azul-oland-100">Agentes</h1>
        </div>

        {/* Links */}
        <nav className="hidden lg:flex space-x-4 rounded-full border-2 p-2">
          <Link
            href="/inicio"
            className={pathname?.startsWith('/inicio')
              ? 'bg-azul-oland-100 text-white rounded-full p-1'
              : 'text-gray-700 hover:text-gray-900 p-1'}
          >
            Inicio
          </Link>
          <Link
            href="/dashboard"
            className={pathname?.startsWith('/dashboard')
              ? 'bg-azul-oland-100 text-white rounded-full p-1'
              : 'text-gray-700 hover:text-gray-900 p-1'}
          >
            Mis cotizaciones
          </Link>
          <a
            href="https://oland.bitrix24.com/crm/deal/kanban/category/24/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-gray-900 p-1"
          >
            CRM
          </a>
        </nav>

        {/* User */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              <span className="sm:inline text-gray-700 capitalize"> {user.name}</span>
              <button onClick={toggleMenu} className="relative" aria-label="Menú de usuario">
                <UsuarioIcon width={32} height={32} styles="text-gray-700" />
              </button>
              <button
                onClick={onLogout}
                className="hidden lg:block px-4 py-2 bg-rojo-oland-100 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <span className="text-gray-700 text-sm sm:text-base">No conectado a Bitrix24</span>
          )}
        </div>
      </div>
    </header>
  );
};
