// app/dashboard/page.tsx
'use client';
import { IBitrixUser } from '@/interfaces/bitrixUser.type';
import { IBitrixData } from '@/interfaces/bitrixData.type';
import { CotizadorForm } from '@/app/(dashboard)/dashboard/components/cotizadorForm';
import { useState, useEffect } from 'react';


export default function Dashboard() {
  const [bitrixData, setBitrixData] = useState<IBitrixData>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Verificar si tenemos acceso a Bitrix24
    fetchBitrixData();
  }, []);

  const fetchBitrixData = async () => {
    try {
      const response = await fetch('/api/bitrix/user');
      if (response.ok) {
        const data = await response.json();
        setBitrixData({
          user: data.result,
          loading: false,
          error: null
        });
      } else {
        setBitrixData({
          user: null,
          loading: false,
          error: 'No se pudo cargar la información de Bitrix24'
        });
      }
    } catch (error) {
      setBitrixData({
        user: null,
        loading: false,
        error: 'Error de conexión con Bitrix24'
      });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (bitrixData.loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos de Bitrix24...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Conectado a Bitrix24
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

        {/* Main Content */}
        <CotizadorForm />
        



        <div className="px-4 py-6 sm:px-0">
          {bitrixData.error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error de conexión
                  </h3>
                  <p className="mt-2 text-sm text-red-700">{bitrixData.error}</p>
                </div>
              </div>
            </div>
          ) : bitrixData.user ? (
            <div className="space-y-6">
              {/* User Info Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Información del Usuario Bitrix24
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Nombre Completo
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {bitrixData.user.NAME} {bitrixData.user.LAST_NAME}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {bitrixData.user.EMAIL}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Posición
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {bitrixData.user.WORK_POSITION}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Estado
                      </label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        bitrixData.user.IS_ONLINE === 'Y' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {bitrixData.user.IS_ONLINE === 'Y' ? 'En línea' : 'Fuera de línea'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        ID de Usuario
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {bitrixData.user.ID}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Zona Horaria
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {bitrixData.user.TIME_ZONE}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Acciones Disponibles
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Ver CRM
                    </button>
                    <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      Ver Tareas
                    </button>
                    <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                      Sincronizar Datos
                    </button>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      ¡Integración OAuth exitosa!
                    </h3>
                    <p className="mt-2 text-sm text-green-700">
                      Tu aplicación está correctamente conectada con Bitrix24. Puedes acceder a todos los datos y funciones permitidas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500">No se encontró información del usuario</p>
            </div>
          )}
        </div>

        
      </main>
    </div>
  );
}
