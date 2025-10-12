// src/lib/services/planService.ts
import { setInLocalstorage } from "@/actions/localStorage";
import type { FormValues } from "@/schemas/formSchemas";
import { obtenerPlanPorAseguradora2 } from "@/lib/services/api";
import type { IPlanRequest, IPlanResponse } from "@/interfaces/interfaces.type";

const COMPARADOR_STORAGE_KEY = "comparadorResults";

const aseguradoras = [
  "zurich",
  "chubb",
  "equinoccial",
  "asur",
  "sweaden",
] as const;

const normalize = (value?: string) => value?.trim() ?? "";
const parseNumber = (value?: string) => {
  if (!value) return 0;
  const parsed = Number(value.toString().replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildNames = (fullName: string) => {
  const parts = normalize(fullName)
    .split(" ")
    .filter(Boolean);

  if (parts.length === 0) {
    return { name: "", firstLastName: "", secondLastName: "" };
  }

  if (parts.length === 1) {
    return { name: parts[0], firstLastName: parts[0], secondLastName: "" };
  }

  if (parts.length === 2) {
    return { name: parts.join(" "), firstLastName: parts[0], secondLastName: parts[1] };
  }

  const name = parts.slice(0, parts.length - 2).join(" ");
  const firstLastName = parts[parts.length - 2];
  const secondLastName = parts[parts.length - 1];

  return {
    name: name || `${firstLastName} ${secondLastName}`.trim(),
    firstLastName,
    secondLastName,
  };
};

const mapFormToPlanRequest = (form: FormValues): IPlanRequest => {
  const built = buildNames(form.name);
  const baseName = built.name;
  const baseFirst = built.firstLastName;
  const baseSecond = built.secondLastName;

  return {
    // Datos del vehículo
    plate: normalize(form.plate)?.toUpperCase() || "",
    submodelEqui: parseNumber((form as any).submodelEqui) || 786,
    brand: normalize(form.brand)?.toUpperCase() || "",
    model: normalize(form.model)?.toUpperCase() || "",
    year: typeof form.year === "number" ? form.year : new Date().getFullYear(),
    vehicleValue: typeof form.vehicleValue === "number" ? form.vehicleValue : 0,
    type: normalize((form as any).type)?.toUpperCase() || "AUTOMÓVIL",
    subtype: normalize((form as any).subtype)?.toUpperCase() || "SUV",
    extras: typeof (form as any).extras === "number" ? (form as any).extras : 0,
    newVehicle: typeof (form as any).newVehicle === "number" ? (form as any).newVehicle : 0,

    // Localización
    city: normalize(form.city)?.toUpperCase() || "",
    region: undefined, // reservado si alguna aseguradora pide región
    cityCodeMapfre: 1701,

    // Datos del cliente
    identification: normalize(form.identification) || "",
    name: (normalize(form.name) || baseName)?.toUpperCase() || "",
    firstLastName: (normalize((form as any).firstLastName) || baseFirst)?.toUpperCase() || "",
    secondLastName: (normalize((form as any).secondLastName) || baseSecond)?.toUpperCase() || "",
    gender: normalize(form.gender)?.toUpperCase() || "OTRO",
    civilStatus: normalize(form.civilStatus)?.toUpperCase() || "SOLTERO",
    birthdate: normalize((form as any).birthdate) || "1990-01-01",
    age: typeof form.age === "number" ? form.age : 0,
    province: "PICHINCHA",

    // Campos específicos de aseguradoras
    chubb_mm: "AD", // requerido en Zurich, Chubb, Equi, Sweaden
    useOfVehicle: normalize(form.useOfVehicle)?.toUpperCase() || "PARTICULAR", // Chubb lo necesita
    asur_brand: form.brand || undefined, // si Asur requiere
    asur_model: form.model || undefined, // si Asur requiere
  };
};

const serializeError = (error: unknown) => {
  if (!error) return "Error desconocido";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch (_) {
    return String(error);
  }
};

type Aseguradora = typeof aseguradoras[number];

export type PlanQuoteResult = {
  aseguradora: Aseguradora;
  ok: boolean;
  data?: IPlanResponse;
  error?: string;
};

const fetchPlansForInsurers = async (
  payload: IPlanRequest
): Promise<PlanQuoteResult[]> => {
  console.log("[planService] Consultando aseguradoras con payload", payload);
  const responses = await Promise.allSettled(
    aseguradoras.map((aseguradora) =>
      obtenerPlanPorAseguradora2(aseguradora, payload)
    )
  );

  const normalized = responses.map((result, index) => {
    const aseguradora = aseguradoras[index];
    if (result.status === "fulfilled") {
      return {
        aseguradora,
        ok: true,
        data: result.value,
      } satisfies PlanQuoteResult;
    }

    return {
      aseguradora,
      ok: false,
      error: serializeError(result.reason),
    } satisfies PlanQuoteResult;
  });

  try {
    // Log resumen por aseguradora
    console.log(
      "[planService] Resultados por aseguradora",
      normalized.map((n) => ({
        aseguradora: n.aseguradora,
        ok: n.ok,
        dataType: n.ok
          ? Array.isArray(n.data)
            ? `Array(${(n.data as any[]).length})`
            : typeof n.data
          : undefined,
        error: n.ok ? undefined : n.error,
      }))
    );
  } catch {}

  setInLocalstorage(COMPARADOR_STORAGE_KEY, normalized);
  console.log("[planService] Guardado en localStorage", {
    key: COMPARADOR_STORAGE_KEY,
    items: normalized.length,
  });

  return normalized;
};

export const sendPlanRequest = async (form: FormValues) => {
  const payload = mapFormToPlanRequest(form);
  console.log("[planService] Payload construido desde formulario", payload);
  const results = await fetchPlansForInsurers(payload);
  console.log("[planService] Resultados normalizados listos", results);
  return {
    payload,
    results,
  };
};


