import { IPlanResponse } from "@/interfaces/interfaces.type";
import { useEffect } from "react";
import { X } from "lucide-react";
import { AseguradorasLogo } from "@/configuration/constants";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import React from "react";
import { COBERTURAS_ORDENADAS } from "@/configuration/constants";
import { formatearMontoConTexto } from "@/lib/utils";

export interface ComparadorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlans: IPlanResponse[];
  onGeneratePdf?: () => void;
  onGeneratePdfCustom?: () => void;
}

export function formatearCobertura(valor: string | number | null) {
  if (valor === "1" || valor === 1) {
    return <CheckCircle className="w-5 h-5 text-green-500 " />;
  }
  if (valor === "0" || valor === 0) {
    return <XCircle className="w-5 h-5 text-red-500 " />;
  }
  if (typeof valor === "string" && valor.trim() !== "") {
    return valor;
  }
  /* // 2️⃣ Si es uno de los tres primeros (Responsabilidad Civil, Muerte Accidental, Gastos Médicos)
  if (index <= 2) {
    return formatearMontoConTexto(valor:);
  }

  // 3️⃣ Si tiene valores en dólares o USD en cualquier otra parte
  if (typeof valor === "string" && /\$[\d.,]+/.test(valor)) {
    return formatearMontoConTexto(valor);
  }

  // 4️⃣ Texto normal
  if (typeof valor === "string" && valor.trim() !== "") {
    return valor;
  }
 */
  return "N/A";
}

export const ComparadorModal = ({
  isOpen,
  onClose,
  selectedPlans,
  onGeneratePdf,
  onGeneratePdfCustom,
}: ComparadorModalProps) => {
  // Prevenir scroll del body cuando el modal está abierto

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // 👇 Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-white opacity-80 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del Modal */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100   rounded-lg transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={24} className="text-gray-500  " />
              </button>
            </div>
            <h2 className="text-2xl text-center font-bold text-gray-900">
              Coberturas Y Beneficios
            </h2>
          </div>

          {/* Contenido del Modal (scrolleable) */}
          <div className="overflow-x-auto p-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left  font-semibold bg-gray-50"></th>
                  {selectedPlans.map((plan, index) => (
                    <th
                      key={`${plan.insurer}-${plan.planName}-${index}`}
                      className="text-left  font-semibold bg-gray-50"
                    >
                      <img
                        className="w-24 h-24"
                        src={
                          AseguradorasLogo.find((logo) =>
                            logo.name
                              .toLowerCase()
                              .includes(plan.insurer.toLowerCase())
                          )?.img || ""
                        }
                        alt={plan.insurer}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2 font-semibold">Plan</td>
                  {selectedPlans.map((plan, index) => (
                    <td key={index} className="p-2 text-gray-600">
                      {plan.planName}
                    </td>
                  ))}
                </tr>
                {/*  prima Total mensual */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2 font-semibold">
                    Prima Total (valor mensual)
                  </td>
                  {selectedPlans.map((plan, index) => {
                    const primaMensual = plan.totalPremium / plan.period;

                    const primaMensualFormatted = primaMensual.toLocaleString(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    );
                    return (
                      <td key={index} className="p-2">
                        {primaMensualFormatted}
                      </td>
                    );
                  })}
                </tr>

                {/* 
                  "Responsabilidad Civil",
                  "Muerte Accidental",
                  "Gastos Médicos",
                  "Amparo Patrimonial",
                  "Pérdida parcial por daño o robo",
                  "Pérdida total por daño",
                  "Pérdida total por robo (sin dispositivo de rastreo)",
                  "Pérdida total por robo (con dispositivo de rastreo)",
                  "Pacto Andino",
                  "Airbag",
                  "Servicio de grúa",
                  "Asistencia vehicular",
                  "Asistencia legal",
                  "Asistencia exequial",
                  "Auto sustituto",  */}
                {COBERTURAS_ORDENADAS.map((nombre, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-2 font-semibold">{nombre}</td>
                    {selectedPlans.map((plan, index) => {
                      const valor = plan.coverageBenefits?.[i] ?? "N/A";
                      return (
                        <td key={index} className="p-2 ">
                          {formatearCobertura(valor)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer del Modal */}
          <div className="flex justify-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
            {onGeneratePdf && (
              <Button variant="oland" onClick={onGeneratePdf}>
                PDF Agentes Oland
              </Button>
            )}

            {onGeneratePdfCustom && (
              <Button variant="oland" onClick={onGeneratePdfCustom}>
                PDF Personalizado
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
