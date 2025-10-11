import { z } from "zod";

export const personSchema = z.object({
  name: z.string().trim().min(2, { message: "El nombre es obligatorio" }),
  email: z.string().trim().toLowerCase().email({ message: "El email no es válido" }),
  phone: z.string().trim().min(10, { message: "El teléfono no es válido, debe tener 10 números" }),
  identification: z.string().trim().min(10, { message: "La cédula no es válida, debe tener 10 números" }),
  city: z.string().trim().min(2, { message: "La ciudad es obligatoria" }),

  // opcionales SIN preprocess (deja undefined si no tienes valor)
  age: z.coerce.number().min(18, { message: "Debes ser mayor de edad" }).optional(),
  gender: z.enum(["masculino", "femenino", "otro"]).optional(),
  civilStatus: z.enum(["soltero", "casado", "divorciado", "viudo"]).optional(),
  firstLastName: z.string().trim().optional(),
  secondLastName: z.string().trim().optional(),
  birthdate: z.string().trim().optional(),

  // requerido
  useOfVehicle: z.enum(["particular", "comercial", "taxi", "otro"], {
    message: "Seleccione un tipo de uso del vehículo",
  }),
});

export const vehicleSchema = z.object({
  plate: z
    .string()
    .trim()
    .min(4, { message: "La placa no es válida, debe tener 4 caracteres" })
    .transform((v) => v.replace(/\s+/g, "").toUpperCase()),
  model: z.string().trim().min(2, { message: "El modelo no es válido, debe tener 2 caracteres" }),
  brand: z.string().trim().min(2, { message: "La marca no es válida, debe tener 2 caracteres" }),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
  vehicleValue: z.coerce.number().min(10, { message: "El monto mínimo es de $10" }),

  // opcionales
  type: z.string().trim().optional(),
  subtype: z.string().trim().optional(),
  submodelEqui: z.union([z.string(), z.number()]).optional(),
  extras: z.coerce.number().min(0).optional(),
  newVehicle: z.coerce.number().int().min(0).max(1).optional(),
});

export const formSchema = personSchema.merge(vehicleSchema);
export type FormValues = z.infer<typeof formSchema>;
