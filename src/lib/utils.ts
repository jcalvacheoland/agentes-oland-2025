import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//función para formatear placa al extraer de base de datos en el comparador de [page]/comparador
export const formatoPlaca = (placaFromDataBase: string | undefined | null): string => {
  if (!placaFromDataBase) return "";
  // Eliminar espacios y convertir a mayúsculas
  const cleanPlaca = placaFromDataBase.trim().toUpperCase().replace(/[\s-]/g, "");
  if (cleanPlaca.length < 6) return placaFromDataBase.toUpperCase();
  
  // Separar letras y números
  const letters = cleanPlaca.slice(0, 3); // Primeras 3 letras
  const numbers = cleanPlaca.slice(3);     // El resto son números
  
  // Formato: ABC-1234
  return `${letters}-${numbers}`;
};

// Extraer cobertura específica en el Modal Comparador
export function extraerCobertura(principals: any, tipo: string): string {
  const coberturas = principals?.["PRINCIPALES COBERTURAS"] || "";
  const regex = new RegExp(`${tipo}:\\s*([^/*\\n]+)`, "i");
  const match = coberturas.match(regex);
  return match && match[1] ? match[1].trim() : "N/A";
}


