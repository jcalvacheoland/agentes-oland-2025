"use client";
import { useBitrixUser } from "@/hooks/useBitrixUser";
import { TablaDeCotizaciones } from "./components/tablaDeCotizaciones";

export default function DashboardHomePage() {
  const { user, loading, error } = useBitrixUser();

  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            {error ? (
              <div className="text-red-600">Error: {error}</div>
            ) : (
              <div className="text-center">
                <TablaDeCotizaciones userId={user?.id} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

