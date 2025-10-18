import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectUsoVehiculoProps {
  errors: any
  setValue: any
  value?: string | null
}

export function SelectUsoVehiculo({
  errors,
  setValue,
  value,
}: SelectUsoVehiculoProps) {
  const selectedValue =
    typeof value === "string" && value.length > 0 ? value : undefined
  return (
    <div className="space-y-2">
      <Label htmlFor="tipoUso" className="text-sm font-semibold text-gray-700">
        Uso del Vehículo
      </Label>

      <Select
        value={selectedValue}
        onValueChange={(newValue) =>
          setValue("vehiculo.tipoUso", newValue, { shouldDirty: true })
        }
      >
        <SelectTrigger id="tipoUso" className="h-11 w-full">
          <SelectValue placeholder="Seleccionar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Particular">Particular</SelectItem>
          <SelectItem value="Comercial">Comercial</SelectItem>
          <SelectItem value="Taxi">Taxi</SelectItem>
          <SelectItem value="Uber">Uber</SelectItem>
        </SelectContent>
      </Select>

      {errors.vehiculo?.tipoUso && (
        <p className="text-sm text-red-600">{errors.vehiculo.tipoUso.message}</p>
      )}
    </div>
  )
}
