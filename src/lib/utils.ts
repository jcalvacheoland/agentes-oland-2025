import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CheckCircle, XCircle } from "lucide-react";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//función para formatear placa al extraer de base de datos en el comparador de [page]/comparador
export const formatoPlaca = (
  placaFromDataBase: string | undefined | null
): string => {
  if (!placaFromDataBase) return "";
  // Eliminar espacios y convertir a mayúsculas
  const cleanPlaca = placaFromDataBase
    .trim()
    .toUpperCase()
    .replace(/[\s-]/g, "");
  if (cleanPlaca.length < 6) return placaFromDataBase.toUpperCase();

  // Separar letras y números
  const letters = cleanPlaca.slice(0, 3); // Primeras 3 letras
  const numbers = cleanPlaca.slice(3); // El resto son números

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
export function formatPrecioUSD(valor: any, conSimbolo = true) {
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

// 🔹 Función que formatea el número dentro de un texto, manteniendo el resto igual
export function formatearMontoDentroDeTexto(texto: string) {
  const match = texto.match(/\$[\s]?\d[\d.,]*/);
  if (!match) return texto;

  const numeroLimpio = match[0].replace(/[^0-9.,]/g, "");
  const normalizado = numeroLimpio.replace(/\./g, "").replace(",", ".");
  const numero = parseFloat(normalizado);

  if (isNaN(numero)) return texto;

  // Formatea el número como USD sin decimales
  const montoFormateado = numero.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  // Reemplaza solo la parte del monto, dejando el resto intacto
  return texto.replace(match[0], montoFormateado);
}
//funcion para formateaar pdf en el PDF
export function formatearMontoTextoPlano(texto: string) {
  if (!texto) return "N/A";

  // Busca algo como "$20.000", "$ 25000", "$5,000"
  const match = texto.match(/\$[\s]?\d[\d.,]*/);
  if (!match) return texto;

  const numeroLimpio = match[0].replace(/[^0-9.,]/g, "");
  const normalizado = numeroLimpio.replace(/\./g, "").replace(",", ".");
  const numero = parseFloat(normalizado);

  if (isNaN(numero)) return texto;

  // Formatea el número con separadores de miles
  const montoFormateado = numero.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  // Devuelve el texto con el monto reemplazado
  return texto.replace(match[0], montoFormateado);
}
// 🔹 Utilidad común para pdf
export function formatearNumeroMoneda(valor: number) {
  const num = Number(valor) || 0;
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

//funcion para cambiar el nombre de s123 chubb a CHUBB
export const planNombres: Record<string, string> = {
  "s123 chubb": "CHUBB",
};

//funcion para normalizar el telefono al enviar mensaje de WhatsApp usado en PlanSelector
export function normalizarTelefono(phone?: string | null) {
  if (!phone) return "";
  // Elimina espacios, guiones y paréntesis
  let limpio = phone.replace(/\D/g, "");
  // Si no empieza con 593, lo agrega
  if (!limpio.startsWith("593")) {
    limpio = `593${limpio}`;
  }
  return limpio;
}
//funcion para enviar el nombre del cliente al componenete WhatsAppLinkPdf usado en PlanSelector
export function obtenerPrimerNombre(nombreCompleto?: string | null) {
  if (!nombreCompleto) return "Cliente";
  const partes = nombreCompleto.trim().split(/\s+/);
  return partes[0] || "Cliente";
}
