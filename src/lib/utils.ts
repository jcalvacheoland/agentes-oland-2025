import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CheckCircle, XCircle } from "lucide-react";
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

/**
 * Formatea un número como precio en USD, con separador de miles y dos decimales.
 * @param {number} valor - El valor numérico a formatear.
 * @param {boolean} [conSimbolo=true] - Si se muestra o no el símbolo "$".
 * @returns {string} Ejemplo: "$5,434.10" o "5,434.10 USD"
 */
export function formatPrecioUSD(valor:any, conSimbolo = true) {
  if (typeof valor !== "number" || isNaN(valor)) return "—";

  if (conSimbolo) {
    return valor.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  } else {
    return (
      valor.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " USD"
    );
  }
}

//formatear precios en las cobertutas del modal:
export function formatearMontoConTexto(texto: string) {
  const match = texto.match(/\$[\d.,]+/);
  if (match) {
    const numeroLimpio = match[0].replace(/[^0-9.,]/g, "");
    const normalizado = numeroLimpio.replace(/\./g, "").replace(",", ".");
    const numero = parseFloat(normalizado);

    if (!isNaN(numero)) {
      const precioFormateado = numero.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      });
      return texto.replace(match[0], precioFormateado);
    }
  }
  return texto;
}

