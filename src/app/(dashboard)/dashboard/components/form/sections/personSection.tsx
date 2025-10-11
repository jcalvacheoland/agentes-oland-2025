"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { obtenerPersonaPorCedula } from "@/lib/services/api";
import { IPersona } from "@/interfaces/interfaces.type";
import { useFormContext } from "react-hook-form";
import { FormValues } from "@/schemas/formSchemas";
import { validateCedula } from "@/configuration/utils";

export const GENDERS = {
  MASCULINO: "masculino",
  FEMENINO: "femenino",
  OTRO: "otro",
} as const;

export const CIVIL_STATUSES = {
  SOLTERO: "soltero",
  CASADO: "casado",
  DIVORCIADO: "divorciado",
  VIUDO: "viudo",
} as const;

const mapGender = (g?: string): FormValues["gender"] => {
  if (!g) return undefined;
  const lower = g.toLowerCase();
  if (lower.includes("mas")) return GENDERS.MASCULINO;
  if (lower.includes("fem")) return GENDERS.FEMENINO;
  return GENDERS.OTRO;
};

const mapCivilStatus = (s?: string): FormValues["civilStatus"] => {
  if (!s) return undefined;
  const lower = s.toLowerCase();
  if (lower.includes("sol")) return CIVIL_STATUSES.SOLTERO;
  if (lower.includes("cas")) return CIVIL_STATUSES.CASADO;
  if (lower.includes("div")) return CIVIL_STATUSES.DIVORCIADO;
  if (lower.includes("viu")) return CIVIL_STATUSES.VIUDO;
  return undefined;
};

export const PersonSection = () => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<FormValues>();

  const identification = watch("identification") ?? "";

  const [isFetchingPerson, setIsFetchingPerson] = useState(false);
  const [personMessage, setPersonMessage] = useState<string | null>(null);

  const handleSearchByCedula = async () => {
    setPersonMessage(null);

    const cedulaClean = (identification || "").toString().replace(/\D/g, "");
    if (cedulaClean.length !== 10) {
      setPersonMessage("La cédula debe tener 10 dígitos.");
      return;
    }

    if (!validateCedula(cedulaClean)) {
      setPersonMessage("Cédula inválida según el algoritmo.");
      return;
    }

    try {
      setIsFetchingPerson(true);
      const persona: IPersona | null = await obtenerPersonaPorCedula(cedulaClean);
      if (!persona) {
        setPersonMessage("No se encontró información para esa cédula.");
        return;
      }

      const namesOnly = `${persona.names ?? persona.name ?? ""}`.trim();

      setValue("name", namesOnly, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      setValue("identification", cedulaClean, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      setValue("city", (persona as any).city ?? "", { shouldValidate: false, shouldDirty: true, shouldTouch: true });
      setValue("age", typeof persona.age === "number" ? persona.age : undefined, { shouldValidate: true, shouldDirty: true, shouldTouch: true });

      if (persona.firstLastName) setValue("firstLastName", String(persona.firstLastName), { shouldDirty: true, shouldTouch: true });
      if (persona.secondLastName) setValue("secondLastName", String(persona.secondLastName), { shouldDirty: true, shouldTouch: true });
      if ((persona as any).birthDate) setValue("birthdate", String((persona as any).birthDate), { shouldDirty: true, shouldTouch: true });

      setValue("gender", mapGender(persona.gender), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      setValue("civilStatus", mapCivilStatus(persona.civilStatus), { shouldValidate: true, shouldDirty: true, shouldTouch: true });

      setPersonMessage("Datos cargados correctamente.");
    } catch (err) {
      console.error("Error buscando persona:", err);
      setPersonMessage("Ocurrió un error al buscar la persona. Intenta de nuevo.");
    } finally {
      setIsFetchingPerson(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Datos de la Persona</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cédula con lupa */}
        <div className="space-y-2">
          <Label htmlFor="identification" className="font-medium">Cédula de Identidad</Label>
          <div className="flex gap-2">
            <Input {...register("identification")} id="identification" placeholder="17xxxxxxxx" className="h-11" />
            <Button type="button" variant="ghost" onClick={handleSearchByCedula} className="h-11 flex items-center px-3" aria-label="Buscar persona por cédula">
              {isFetchingPerson ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" color="black" />}
            </Button>
          </div>

          {isFetchingPerson && <p className="text-sm text-blue-600">Buscando datos...</p>}
          {personMessage && <p className="text-sm text-amber-600">{personMessage}</p>}
          {(errors as any).identification && <p className="text-red-500 text-sm">{(errors as any).identification.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="font-medium">Correo Electrónico</Label>
          <Input {...register("email")} id="email" type="email" placeholder="ejemplo@correo.com" className="h-11" />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        {/* Nombres */}
        <div className="space-y-2 col-span-2">
          <Label htmlFor="name" className="font-medium">Nombres</Label>
          <Input {...register("name")} id="name" placeholder="Ingrese sus nombres" className="h-11" />
          {errors.name && <p className="text-red-500 text-sm">{(errors as any).name.message}</p>}
        </div>

        {/* Apellidos y fecha de nacimiento (opcional) */}
        <div className="space-y-2">
          <Label htmlFor="firstLastName" className="font-medium">Primer Apellido</Label>
          <Input {...register("firstLastName")} id="firstLastName" placeholder="Ej: Pérez" className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondLastName" className="font-medium">Segundo Apellido</Label>
          <Input {...register("secondLastName")} id="secondLastName" placeholder="Ej: González" className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthdate" className="font-medium">Fecha de nacimiento</Label>
          <Input {...register("birthdate")} id="birthdate" type="date" className="h-11" />
        </div>

        {/* Resto de campos */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="font-medium">Teléfono</Label>
          <Input {...register("phone")} id="phone" placeholder="09xxxxxxxx" className="h-11" />
          {(errors as any).phone && <p className="text-red-500 text-sm">{(errors as any).phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="font-medium">Ciudad de Residencia</Label>
          <Input {...register("city")} id="city" placeholder="Ej: Quito" className="h-11" />
          {errors.city && <p className="text-red-500 text-sm">{(errors as any).city.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age" className="font-medium">Edad</Label>
          <Input {...register("age")} id="age" type="text" placeholder="Ej: 30" className="h-11" />
          {(errors as any).age && <p className="text-red-500 text-sm">{(errors as any).age.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="font-medium">Género</Label>
          <select {...register("gender")} id="gender" className="h-11 border rounded w-full px-3">
            <option value="">Selecciona...</option>
            <option value={GENDERS.MASCULINO}>Masculino</option>
            <option value={GENDERS.FEMENINO}>Femenino</option>
            <option value={GENDERS.OTRO}>Otro</option>
          </select>
          {(errors as any).gender && <p className="text-red-500 text-sm">{(errors as any).gender.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="civilStatus" className="font-medium">Estado Civil</Label>
          <select {...register("civilStatus")} id="civilStatus" className="h-11 border rounded w-full px-3">
            <option value="">Selecciona...</option>
            <option value={CIVIL_STATUSES.SOLTERO}>Soltero(a)</option>
            <option value={CIVIL_STATUSES.CASADO}>Casado(a)</option>
            <option value={CIVIL_STATUSES.DIVORCIADO}>Divorciado(a)</option>
            <option value={CIVIL_STATUSES.VIUDO}>Viudo(a)</option>
          </select>
          {(errors as any).civilStatus && <p className="text-red-500 text-sm">{(errors as any).civilStatus.message}</p>}
        </div>
      </div>
    </div>
  );
};
