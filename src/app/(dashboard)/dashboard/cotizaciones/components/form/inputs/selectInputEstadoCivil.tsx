import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectEstadoCivilProps {
  errors: any
  setValue: any
  value?: string | null
}

export function SelectEstadoCivil({
  errors,
  setValue,
  value,
}: SelectEstadoCivilProps) {
  const selectedValue =
    typeof value === "string" && value.length > 0 ? value : undefined
  return (
    <div className="space-y-2">
      <Label htmlFor="estadoCivil" className="text-sm font-semibold text-gray-700">
        Estado Civil
      </Label>

      <Select
        value={selectedValue}
        onValueChange={(newValue) =>
          setValue("cliente.estadoCivil", newValue, { shouldDirty: true })
        }
      >
        <SelectTrigger id="estadoCivil" className="h-11 w-full">
          <SelectValue placeholder="Seleccionar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Soltero">Soltero</SelectItem>
          <SelectItem value="Casado">Casado</SelectItem>
          <SelectItem value="Divorciado">Divorciado</SelectItem>
          <SelectItem value="Viudo">Viudo</SelectItem>
          <SelectItem value="Union de hecho">Unión de hecho</SelectItem>
        </SelectContent>
      </Select>

      {errors.cliente?.estadoCivil && (
        <p className="text-sm text-red-600">{errors.cliente.estadoCivil.message}</p>
      )}
    </div>
  )
}
