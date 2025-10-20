import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectGeneroProps {
  errors: any
  setValue: any
  value?: string | null
}

export function SelectGenero({
  errors,
  setValue,
  value,
}: SelectGeneroProps) {
  const selectedValue =
    typeof value === "string" && value.length > 0 ? value : undefined
  return (
    <div className="space-y-2">
      <Label htmlFor="genero" className="text-sm font-semibold text-gray-700">
        Género
      </Label>

      <Select
        value={selectedValue}
        onValueChange={(newValue) =>
          setValue("cliente.genero", newValue, { shouldDirty: true, shouldValidate: true })
        }
      >
        <SelectTrigger id="genero" className="h-11 w-full">
          <SelectValue placeholder="Seleccionar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="masculino">Masculino</SelectItem>
          <SelectItem value="femenino">Femenino</SelectItem>
          <SelectItem value="otro">Otro</SelectItem>
        </SelectContent>
      </Select>

      {errors.cliente?.genero && (
        <p className="text-sm text-red-600">{errors.cliente.genero.message}</p>
      )}
    </div>
  )
}
