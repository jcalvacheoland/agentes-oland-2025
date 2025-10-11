"use client";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "@/schemas/formSchemas";
import { obtenerVehiculoPorPlaca } from "@/lib/services/api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const VehicleSection = () => {
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<FormValues>();

  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const doLookup = useCallback(async () => {
    const plate = getValues("plate");
    const normalized = plate?.replace(/\s+/g, "").toUpperCase();

    if (!normalized || normalized.length < 4) return;
    setLookupLoading(true);
    setLookupError(null);

    try {
      const data = await obtenerVehiculoPorPlaca(normalized);
      if (!data) {
        setLookupError("No se encontraron datos para la placa ingresada.");
        return;
      }

      if (data.brand) setValue("brand", String(data.brand));
      if (data.model) setValue("model", String(data.model));
      if (data.year !== undefined && data.year !== null) setValue("year", Number(data.year));
      if (data.value !== undefined && data.value !== null) {
        const monto = Math.round(Number(data.value));
        setValue("vehicleValue", monto);
      }

      const anyData: any = data as any;
      if (anyData?.type) setValue("type", String(anyData.type));
      if (anyData?.subtype) setValue("subtype", String(anyData.subtype));
      const submodel = anyData?.submodelEqui ?? anyData?.equiCodeSubmodel ?? anyData?.codeSubmodel;
      if (submodel !== undefined && submodel !== null) {
        setValue("submodelEqui", typeof submodel === "number" ? submodel : String(submodel));
      }
    } catch (err) {
      console.error("Error al consultar placa:", err);
      setLookupError("No se pudo consultar la placa. Intenta nuevamente.");
    } finally {
      setLookupLoading(false);
    }
  }, [getValues, setValue]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Datos del Vehículo</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="plate" className="font-medium">Placa del Vehículo</Label>
          <div className="flex gap-2">
            <Input
              {...register("plate")}
              id="plate"
              placeholder="ABC1234"
              className="h-11"
              onBlur={doLookup}
            />
            <Button type="button" variant="secondary" className="h-11 px-4" onClick={doLookup}>
              {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          {(errors as any).plate && (
            <p className="text-red-500 text-sm">{(errors as any).plate.message}</p>
          )}
          {lookupError && (
            <p className="text-amber-600 text-sm mt-1">{lookupError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand" className="font-medium">Marca del Vehículo</Label>
          <Input
            {...register("brand")}
            id="brand"
            placeholder="Toyota, Chevrolet, etc."
            className="h-11"
            disabled={lookupLoading}
          />
          {(errors as any).brand && (
            <p className="text-red-500 text-sm">{(errors as any).brand.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="model" className="font-medium">Modelo</Label>
          <Input
            {...register("model")}
            id="model"
            placeholder="Ej: Hilux, Captiva"
            className="h-11"
            disabled={lookupLoading}
          />
          {(errors as any).model && (
            <p className="text-red-500 text-sm">{(errors as any).model.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year" className="font-medium">Año</Label>
          <Input
            {...register("year")}
            id="year"
            placeholder="2020"
            className="h-11"
            disabled={lookupLoading}
          />
          {(errors as any).year && (
            <p className="text-red-500 text-sm">{(errors as any).year.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicleValue" className="font-medium">Valor Asegurado ($)</Label>
          <Input
            {...register("vehicleValue")}
            id="vehicleValue"
            placeholder="Ej: 15000"
            className="h-11"
          />
          {(errors as any).vehicleValue && (
            <p className="text-red-500 text-sm">{(errors as any).vehicleValue.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="useOfVehicle" className="font-medium">Tipo de uso</Label>
          <Select
            onValueChange={(value) => setValue("useOfVehicle", value as "particular" | "comercial" | "taxi" | "otro")}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Selecciona el tipo de uso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="particular">Particular</SelectItem>
              <SelectItem value="comercial">Comercial</SelectItem>
              <SelectItem value="taxi">Taxi</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
          {(errors as any).useOfVehicle && (
            <p className="text-red-500 text-sm">{(errors as any).useOfVehicle.message}</p>
          )}
        </div>

        {/* Campos comunes adicionales */}
        <div className="space-y-2">
          <Label htmlFor="type" className="font-medium">Tipo</Label>
          <Input {...register("type")} id="type" placeholder="AUTOMÓVIL / SUV / JEEP" className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtype" className="font-medium">Subtipo</Label>
          <Input {...register("subtype")} id="subtype" placeholder="Opcional" className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="submodelEqui" className="font-medium">Submodelo (Equivalencia)</Label>
          <Input {...register("submodelEqui")} id="submodelEqui" placeholder="Código de submodelo" className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="extras" className="font-medium">Extras ($)</Label>
          <Input type="number" step="1" min="0" {...register("extras", { valueAsNumber: true })} id="extras" className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newVehicle" className="font-medium">Vehículo nuevo</Label>
          <select id="newVehicle" className="h-11 border rounded w-full px-3" {...register("newVehicle") as any}>
            <option value={0}>No</option>
            <option value={1}>Sí</option>
          </select>
        </div>
      </div>
    </div>
  );
};
