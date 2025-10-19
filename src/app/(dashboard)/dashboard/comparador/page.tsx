"use client";
import React, { useEffect, useRef, useState } from "react";
import { IPlanRequest, IPlanResponse } from "@/interfaces/interfaces.type";
import { obtenerPlanPorAseguradora2 } from "@/lib/services/api";
import { HeaderCotizador } from "./components/header";
import Planes from "./components/planes";
import { createCotizacion } from "@/actions/cotizaciones.actions";
import { useSession } from "next-auth/react";

export default function ComparadorPage() {
  const { data: session, status } = useSession();
  // <<< aquí creamos el state: plan y la función para actualizarlo setPlan >>>
  const [plan, setPlan] = useState<IPlanRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAll, setLoadingAll] = useState(false); // para enviar a varias aseguradoras (automático)
  const [errorAseg, setErrorAseg] = useState<string | null>(null);
  const [responsesByAseg, setResponsesByAseg] = useState<
    Record<string, IPlanResponse | null>
  >({});

  const ranOnceRef = useRef(false); // evita doble ejecución en StrictMode

  // ajusta la lista de aseguradoras según tu backend
  const aseguradoras = ["zurich", "chubb", "asur", "sweaden"];

  /* ---------------- sessionStorage cache helpers ---------------- */
  const makeCacheKey = (plate: string) => `cotizaciones_${plate}`;

  function readCacheForPlate(
    plate: string
  ): Record<string, IPlanResponse | null> | null {
    try {
      const key = makeCacheKey(plate);
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed as Record<string, IPlanResponse | null>;
    } catch (err) {
      console.warn("Error leyendo cache de sessionStorage:", err);
      return null;
    }
  }

  function writeCacheForPlate(
    plate: string,
    data: Record<string, IPlanResponse | null>
  ) {
    try {
      const key = makeCacheKey(plate);
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn("Error guardando cache en sessionStorage:", err);
    }
  }

  /* ---------------- función para enviar a múltiples aseguradoras (acepta plan por parámetro) ---------------- */
  const sendPlanToMultiple = async (
    aseguradorasList: string[],
    planArg?: IPlanRequest
  ) => {
    const planToSend = planArg ?? plan;
    if (!planToSend) {
      setErrorAseg("No hay plan para enviar.");
      return;
    }
    if (loadingAll) return;
    setLoadingAll(true);
    setErrorAseg(null);

    try {
      const promises = aseguradorasList.map(async (aseg) => {
        try {
          const resp = await obtenerPlanPorAseguradora2(aseg, planToSend);
          return { aseg, resp, error: null };
        } catch (e: any) {
          return { aseg, resp: null, error: e?.message ?? "error desconocido" };
        }
      });

      const results = await Promise.all(promises);

      const map: Record<string, IPlanResponse | null> = {};
      results.forEach((r) => {
        map[r.aseg] = r.resp ?? null;
        if (r.error) console.warn(`Error ${r.aseg}:`, r.error);
      });

      setResponsesByAseg((prev) => ({ ...prev, ...map }));
      console.log("Resultados paralelos:", results);

      // guardar en sessionStorage si hay placa válida
      if (planToSend.plate && planToSend.plate.trim() !== "") {
        writeCacheForPlate(planToSend.plate, map);
        console.log(
          "Guardadas respuestas en sessionStorage para placa:",
          planToSend.plate
        );
      }
    } catch (err) {
      console.error("Error global al cotizar múltiples:", err);
      setErrorAseg("Error al cotizar varias aseguradoras.");
    } finally {
      setLoadingAll(false);
    }
  };

  /* ---------------- useEffect: leer localStorage, mapear y disparar cotización automática (con cache) ---------------- */
 useEffect(() => {

  if (ranOnceRef.current) return;
  ranOnceRef.current = true;

  const vehiculoDataFromLocalStorage = localStorage.getItem("vehiculo");
  const clienteDataFromLocalStorage = localStorage.getItem("clienteVehiculo");

  if (!vehiculoDataFromLocalStorage) {
    setError("No existe la clave 'vehiculo' en localStorage");
    setPlan(null);
    return;
  }

  let vehiculo: any = null;
  let cliente: any = null;

  try {
    vehiculo = JSON.parse(vehiculoDataFromLocalStorage);
  } catch (err) {
    setError("vehiculo no es JSON válido");
    return;
  }

  if (clienteDataFromLocalStorage) {
    try {
      cliente = JSON.parse(clienteDataFromLocalStorage);
    } catch (err) {
      cliente = null;
    }
  }

  const planRequest: IPlanRequest = {
    plate: vehiculo.placa,
    submodelEqui: 50012318,
    brand: vehiculo.marca,
    model: vehiculo.modelo,
    year: vehiculo.anio,
    vehicleValue: Number(vehiculo.avaluo ?? vehiculo.avaluoOriginal),
    type: vehiculo.tipo,
    subtype: "",
    extras: 0,
    newVehicle: 0,
    city: cliente?.ciudad,
    identification: cliente?.cedula,
    name: cliente?.nombres ?? cliente?.name,
    firstLastName:
      cliente?.primerApellido ??
      (cliente?.apellidos ? (cliente.apellidos as string).split(" ")[0] : ""),
    secondLastName:
      cliente?.segundoApellido ??
      (cliente?.apellidos ? (cliente.apellidos as string).split(" ").slice(1).join(" ") : ""),
    gender: cliente?.genero,
    civilStatus: cliente?.estadoCivil,
    birthdate: cliente?.fechaNacimiento,
    age: cliente?.edad,
    cityCodeMapfre: Number(cliente?.codMapfre ?? cliente?.cityCodeMapfre),
    useOfVehicle: vehiculo?.tipoUso,
    chubb_mm: cliente?.chubb_mm || "AD",
  };
  
  console.log("Plan mapeado desde localStorage:", planRequest); 
  setPlan(planRequest);
  setError(null);

  // Flujo automático: guardar en BD y cotizar al mismo tiempo
  (async () => {
    // Revisar cache primero
    if (planRequest.plate && planRequest.plate.trim() !== "") {
      const cached = readCacheForPlate(planRequest.plate);
      if (cached) {
        setResponsesByAseg(cached);
        console.log("Usando cache de sessionStorage para placa:", planRequest.plate);
        
        // Aún así guardamos en BD aunque tengamos cache
        
        return;
      }
    }

    // Si no hay cache, cotizamos Y guardamos en paralelo
    setLoadingAll(true);
    setErrorAseg(null);
    
    try {
      // Ejecutar ambas operaciones en paralelo
      const [cotizacionResult] = await Promise.all([
        createCotizacion(planRequest),
        sendPlanToMultiple(aseguradoras, planRequest)
      ]);

      if (cotizacionResult.success) {
        console.log("✅ Cotización guardada en BD:", cotizacionResult.data?.id);
      } else {
        console.error("❌ Error guardando cotización:", cotizacionResult.error);
      }
    } catch (error) {
      console.error("Error en el proceso:", error);
    } finally {
      setLoadingAll(false);
    }
  })();
}, []); // solo se ejecuta al montar

  // --- AQUÍ: obtener valores para pasar al HeaderCotizador ---
  // Renderizamos placeholders hasta que el efecto cargue la información real en `plan`
  const headerName = plan?.name ?? "-";
  const headerVehicle = plan?.brand ?? "";
  const headerModel = plan?.model ?? "";
  const headerYear =
    typeof plan?.year === "number" ? plan.year : Number(plan?.year ?? 0);
  const headerValorAsegurado =
    typeof plan?.vehicleValue === "number"
      ? plan.vehicleValue
      : Number(plan?.vehicleValue ?? 0);

  return (
    <div className="p-4">
      {/* Header ahora recibe props desde el plan almacenado en estado */}
      <HeaderCotizador
        name={headerName}
        vehicle={headerVehicle}
        model={headerModel}
        year={headerYear}
        valorAsegurado={headerValorAsegurado} // opcional: si quieres que el header muestre #respuestas o mejor oferta
      />

      {loadingAll && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <div className="font-medium">Estamos cotizando tu vehículo...</div>
          <div className="text-sm text-gray-700 mt-2">
            Esto puede tardar unos segundos.
          </div>
        </div>
      )}

      <Planes responses={responsesByAseg} planRequest={plan}></Planes>
    </div>
  );
}
