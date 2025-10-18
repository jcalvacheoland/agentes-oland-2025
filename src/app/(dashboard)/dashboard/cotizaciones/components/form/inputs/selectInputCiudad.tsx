import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ECUADOR_CITIES } from "@/configuration/constants" // 👈 ajusta la ruta según dónde tengas tu constante

interface SelectCiudadProps {
  errors: any
  setValue: any
  value?: string | null
}

export function SelectCiudad({
  errors,
  setValue,
  value,
}: SelectCiudadProps) {
  const selectedValue =
    typeof value === "string" && value.length > 0 ? value : undefined
  return (
    <div className="space-y-2">
      <Label htmlFor="ciudad" className="text-sm font-semibold text-gray-700">
        Ciudad
      </Label>

      <Select
        value={selectedValue}
        onValueChange={(newValue) =>
          setValue("cliente.ciudad", newValue, { shouldDirty: true })
        }
      >
        <SelectTrigger id="ciudad" className="h-11 w-full">
          <SelectValue placeholder="Seleccionar ciudad" />
        </SelectTrigger>
        <SelectContent>
          {ECUADOR_CITIES.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {errors.cliente?.ciudad && (
        <p className="text-sm text-red-600">{errors.cliente.ciudad.message}</p>
      )}
    </div>
  )
}
