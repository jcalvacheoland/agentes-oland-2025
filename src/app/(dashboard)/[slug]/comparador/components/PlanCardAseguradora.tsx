"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Check } from "lucide-react";
import { formatPrecioUSD } from "@/lib/utils";
export interface PlanCardAseguradoraProps {
  id?: string;
  nombreAseguradora: string;
  logoUrl?: string;
  nombrePlan: string;
  precioAnual: number;
  coberturas?: Array<{ name: string; detail: string }> | null;
  deducible?: string[] | null;
  beneficios?: string[] | null;
  isSelected?: boolean;
  period?:number;
  onToggleSelect?: () => void;
}

import { AseguradorasLogo } from "@/configuration/constants";

export const PlanCardAseguradora = ({
  id,
  nombreAseguradora,
  nombrePlan,
  precioAnual,
  coberturas,
  deducible,
  beneficios,
  isSelected = false,
  period,
  onToggleSelect,
}: PlanCardAseguradoraProps) => {
  const [coberturasOpen, setCoberturasOpen] = useState(false);
  const [deducibleOpen, setDeducibleOpen] = useState(false);
  const [beneficiosOpen, setBeneficiosOpen] = useState(false);

  const hasCoberturas = coberturas && coberturas.length > 0;
  const hasDeducible = deducible && deducible.length > 0;
  const hasBeneficios = beneficios && beneficios.length > 0;

  const calcularPrecioMensual = (precioAnual: number, period:any) => {
  const precioMensual = precioAnual / period;

  return precioMensual.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  };
  
  const planNombres: Record<string, string> = {
    "s123 chubb": "CHUBB",
  };

  const aseguradoraKey = typeof nombreAseguradora === "string" ? nombreAseguradora.toLowerCase() : "";
  const planKey = typeof nombrePlan === "string" ? nombrePlan.toLowerCase() : "";

  return (
    <div
      className={`border rounded-xl shadow-sm transition-all ${
        isSelected
          ? "border-azul-oland-100  shadow-md"
          : "border-azul-oland-100 hover:shadow-md"
      }`}
    >
      <div
        id={id}
        className="relative p-6 space-y-2 rounded-xl cursor-pointer transition-all border bg-card hover:border-azul-oland-100 hover:shadow-lg"
      >
        {/* Icono de selección */}
        {/* Botón con estilo de checkbox */}
        <div className="flex justify-end">
          {onToggleSelect && (
          <button
            onClick={onToggleSelect}
            className={`flex items-center  gap-2 rounded-lg  font-medium transition-all ${
              isSelected
                ? "bg-azul-oland-100 border-azul-oland-100 text-white p-1 "
                : "bg-gray-100  text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center border  ${  
                isSelected ? "bg-white" : "bg-transparent"
              }`}
            >
              {isSelected && (
                <Check size={14} className="text-azul-oland-100" />
              )}
            </div>
            {isSelected ? "Seleccionado" : ""}
          </button>
        )}
        </div>
        

        {/* Layout principal responsive */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-start">
          {/* Sección 1: Logo aseguradora */}
          <div className="flex flex-col items-center gap-2 order-1 lg:order-none lg:min-w-[120px]">
            <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border border-border">
              <img
                className="w-24 h-24"
                src={
                      AseguradorasLogo.find((logo) =>
                        logo?.name?.toLowerCase().includes(nombreAseguradora?.toLowerCase() || "")
                      )?.img || ""
                    }
                alt={nombreAseguradora}
              />
            </div>
          </div>

          {/* Sección 2: Contenido central */}
          <div className="order-3 w-full lg:order-none lg:flex-1">
            {/* Nombre de la aseguradora y del plan */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-foreground mb-1">
                {nombreAseguradora} - {planNombres[planKey] || nombrePlan}
              </h3>
            </div>

            {/* Botones desplegables */}
            <div className="flex gap-4 mt-4">
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                {/* Dropdown Coberturas */}
                <div className="sm:w-1/3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasCoberturas) return;
                      setCoberturasOpen(!coberturasOpen);
                    }}
                    className={`w-full inline-flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                      hasCoberturas
                        ? coberturasOpen
                          ? "border-azul-oland-100 text-azul-oland-100"
                          : "border-transparent text-azul-oland-100 hover:border-azul-oland-100 hover:text-azul-oland-100"
                        : "cursor-not-allowed border-dashed text-gray-400"
                    }`}
                    disabled={!hasCoberturas}
                    aria-expanded={coberturasOpen}
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                        />
                      </svg>
                      Coberturas
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        coberturasOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {coberturasOpen && hasCoberturas && (
                    <div className="mt-2 space-y-1 rounded-md border p-2 text-sm text-foreground">
                      {coberturas.map((cobertura, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="mt-2 h-2 w-2 rounded-full bg-azul-oland-100" />
                          <span className="font-normal">{cobertura.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dropdown Deducible */}
                <div className="sm:w-1/3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasDeducible) return;
                      setDeducibleOpen(!deducibleOpen);
                    }}
                    className={`w-full inline-flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                      hasDeducible
                        ? deducibleOpen
                          ? "border-azul-oland-100 bg-azul-oland-100/5 text-azul-oland-100"
                          : "border-transparent text-gray-700 hover:border-azul-oland-100 hover:text-azul-oland-100"
                        : "cursor-not-allowed border-dashed border-gray-200 text-gray-400"
                    }`}
                    disabled={!hasDeducible}
                    aria-expanded={deducibleOpen}
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                        />
                      </svg>
                      Deducible
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        deducibleOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {deducibleOpen && hasDeducible && (
                    <div className="mt-2 space-y-2 rounded-md border border-gray-200 bg-white p-2 text-sm shadow-sm">
                      {deducible.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-azul-oland-100" />
                          <span className="text-gray-700 leading-relaxed font-normal">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dropdown Beneficios */}
                <div className="sm:w-1/3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasBeneficios) return;
                      setBeneficiosOpen(!beneficiosOpen);
                    }}
                    className={`w-full inline-flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                      hasBeneficios
                        ? beneficiosOpen
                          ? "border-azul-oland-100 bg-azul-oland-100/5 text-azul-oland-100"
                          : "border-transparent text-gray-700 hover:border-azul-oland-100 hover:text-azul-oland-100"
                        : "cursor-not-allowed border-dashed border-gray-200 text-gray-400"
                    }`}
                    disabled={!hasBeneficios}
                    aria-expanded={beneficiosOpen}
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                        />
                      </svg>
                      Beneficios
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        beneficiosOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {beneficiosOpen && hasBeneficios && (
                    <div className="mt-2 space-y-2 rounded-md border border-gray-200 bg-white p-2 text-sm shadow-sm">
                      {beneficios.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-azul-oland-100" />
                          <span className="text-gray-700 leading-relaxed">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sección 3: Precios */}
          <div className="order-2 flex w-full flex-col items-center gap-4 lg:order-none lg:items-end lg:min-w-[180px]">
            <div className="grid grid-cols-2 lg:grid-cols-1">
              <div className="text-center lg:text-right">
                <div className="text-3xl font-bold text-foreground lg:text-4xl">
                  {calcularPrecioMensual(precioAnual, period)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {period} cuotas mensuales
                </div>
                <div className="text-xs text-muted-foreground">
                  Pago con tarjeta de crédito
                </div>
              </div>

              <div className="text-center lg:text-right">
                <div className="text-2xl font-bold text-foreground lg:text-3xl">
                  {formatPrecioUSD(precioAnual)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Incluye impuestos
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
