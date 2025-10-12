"use client";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Car, User, Search } from "lucide-react";
import { obtenerPersonaPorCedula, obtenerVehiculoPorPlaca } from '@/lib/services/api';

/* ==================== SCHEMAS ==================== */
const clienteSchema = z.object({
  cedula: z.string().min(10, "La cédula debe tener al menos 10 caracteres"),
  nombres: z.string().min(2, "Ingrese los nombres").optional().or(z.literal("")),
  apellidos: z.string().optional(),
  primerApellido: z.string().optional(),
  segundoApellido: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  edad: z.string().optional(),
  genero: z.string().optional(),
  estadoCivil: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  celular: z.string().min(10, "El celular debe tener al menos 10 dígitos").optional(),
  ciudad: z.string().optional(),
  provincia: z.string().optional(),
  region: z.string().optional(),
  codMapfre: z.coerce.number().optional(),
});

const vehiculoSchema = z.object({
  marca: z.string().optional(),
  modelo: z.string().optional(),
  anio: z.coerce.number().min(1900).max(2026).optional(),
  placa: z.string().min(6, "Placa inválida").optional(),
  avaluo: z.coerce.number().min(0).optional(),
  avaluoOriginal: z.coerce.number().optional(),
  tipo: z.string().optional(),
  tipoUso: z.string().optional(),
  esNuevo: z.coerce.number().optional(),
  submodelEqui: z.string().optional(),
  idDealBitrix: z.coerce.number().optional(),
});

const formSchema = z.object({
  cliente: clienteSchema,
  vehiculo: vehiculoSchema,
});

type FormSchema = typeof formSchema;
type FormValues = z.infer<FormSchema>;
type FormInputs = z.input<FormSchema>;

/* ==================== UTILIDADES ==================== */
const calcularEdad = (fechaNacimiento: string): string => {
  if (!fechaNacimiento) return "";
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad.toString();
};

const calcularFechaDesdeEdad = (edadStr: string): string => {
  const edad = parseInt(edadStr, 10);
  if (isNaN(edad) || edad <= 0) return "2000-01-01";
  const hoy = new Date();
  const birthYear = hoy.getFullYear() - edad;
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  return `${birthYear}-${month}-${day}`;
};

const normalizarTexto = (value?: string | null) => {
  if (value === undefined || value === null) return "";
  return String(value).replace(/\s+/g, " ").trim();
};

// Formatea placa a formato AAA-### o AAA-#### en mayúsculas
const formatearPlaca = (value?: string | null): string => {
  if (!value) return "";
  const raw = String(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!raw) return "";

  // Obtener primeras 3 letras
  const soloLetras = raw.replace(/[^A-Z]/g, "");
  const letras = soloLetras.slice(0, 3);

  // Obtener hasta 4 dígitos después de las letras detectadas
  // Si el usuario escribió letras y números mezclados, priorizamos 3 letras seguidas + dígitos
  const resto = raw.replace(/^[A-Z]{0,3}/, "");
  const digitos = resto.replace(/[^0-9]/g, "").slice(0, 4);

  if (!letras) {
    // Si no hay letras suficientes, devolvemos solo los dígitos (caso incompleto de entrada)
    return digitos;
  }
  if (!digitos) {
    return letras;
  }
  return `${letras}-${digitos}`;
};

/* ==================== MAPPERS API → FORM ==================== */
const mapearPersonaAFormulario = (persona: any, setValue: any, currentValues: any) => {
  const current = currentValues.cliente || {};
  
  // Normalizar datos de persona
  const primerApellido = normalizarTexto(persona.primerApellido ?? persona.firstLastName ?? "");
  const segundoApellido = normalizarTexto(persona.segundoApellido ?? persona.secondLastName ?? "");
  const apellidosCompletos = normalizarTexto(
    persona.apellidos ?? `${primerApellido} ${segundoApellido}`
  );
  const nombreCompleto = normalizarTexto(persona.name ?? "");

  let nombres = normalizarTexto(
    persona.names ?? persona.nombres ?? persona.nombreSolo ?? ""
  );

  if (!nombres && nombreCompleto) {
    if (apellidosCompletos && nombreCompleto.toUpperCase().startsWith(apellidosCompletos.toUpperCase())) {
      nombres = normalizarTexto(nombreCompleto.slice(apellidosCompletos.length));
    } else {
      nombres = nombreCompleto;
    }
  }

  const datosNormalizados = {
    cedula: persona.cedula ?? persona.identificacion ?? "",
    nombres,
    apellidos: apellidosCompletos,
    primerApellido,
    segundoApellido,
    estadoCivil: persona.estadoCivil ?? persona.civilStatus ?? "",
    genero: persona.genero ?? persona.gender ?? "",
    fechaNacimiento: persona.fechaNacimiento ?? persona.birthDate ?? "",
    edad: persona.edad ?? persona.age ?? "",
    email: persona.email ?? persona.correo ?? "",
    celular: persona.celular ?? persona.telefono ?? "",
    ciudad: persona.ciudad ?? persona.city ?? "",
    provincia: persona.provincia ?? persona.province ?? "",
    region: persona.region ?? persona.regionZona ?? "",
    codMapfre: persona.codMapfre ?? persona.cityCodeMapfre ?? 1701,
  };

  // Mapear campos visibles (solo si están vacíos)
  if (!current.nombres && datosNormalizados.nombres) {
    setValue("cliente.nombres", datosNormalizados.nombres, { shouldValidate: true });
  }
  if (!current.apellidos && datosNormalizados.apellidos) {
    setValue("cliente.apellidos", datosNormalizados.apellidos, { shouldValidate: false });
  }
  if (!current.celular && datosNormalizados.celular) {
    setValue("cliente.celular", datosNormalizados.celular, { shouldValidate: true });
  }
  if (!current.email && datosNormalizados.email) {
    setValue("cliente.email", datosNormalizados.email, { shouldValidate: true });
  }
  if (!current.ciudad && datosNormalizados.ciudad) {
    setValue("cliente.ciudad", datosNormalizados.ciudad, { shouldValidate: false });
  }
  if (!current.cedula && datosNormalizados.cedula) {
    setValue("cliente.cedula", datosNormalizados.cedula, { shouldValidate: true });
  }

  // Mapear campos ocultos/adicionales (siempre se sobrescriben)
  setValue("cliente.primerApellido", datosNormalizados.primerApellido, { shouldValidate: false });
  setValue("cliente.segundoApellido", datosNormalizados.segundoApellido, { shouldValidate: false });
  setValue("cliente.provincia", datosNormalizados.provincia, { shouldValidate: false });
  setValue("cliente.region", datosNormalizados.region, { shouldValidate: false });
  
  if (!current.estadoCivil && datosNormalizados.estadoCivil) {
    setValue("cliente.estadoCivil", datosNormalizados.estadoCivil, { shouldValidate: false });
  }
  if (!current.genero && datosNormalizados.genero) {
    setValue("cliente.genero", datosNormalizados.genero, { shouldValidate: false });
  }

  // Manejar fecha de nacimiento y edad
  if (datosNormalizados.fechaNacimiento) {
    setValue("cliente.fechaNacimiento", datosNormalizados.fechaNacimiento, { shouldValidate: true });
    const edadCalculada = datosNormalizados.edad || calcularEdad(datosNormalizados.fechaNacimiento);
    setValue("cliente.edad", String(edadCalculada), { shouldValidate: true });
  } else if (datosNormalizados.edad) {
    setValue("cliente.edad", String(datosNormalizados.edad), { shouldValidate: true });
    const fechaDerivada = calcularFechaDesdeEdad(String(datosNormalizados.edad));
    setValue("cliente.fechaNacimiento", fechaDerivada, { shouldValidate: false });
  }

  // codMapfre
  const codMapfre = Number(datosNormalizados.codMapfre);
  if (!isNaN(codMapfre)) {
    setValue("cliente.codMapfre", codMapfre, { shouldValidate: false });
  }
};

const mapearVehiculoAFormulario = (vehiculo: any, setValue: any, currentValues: any) => {
  const current = currentValues.vehiculo || {};

  // Normalizar datos de vehículo
  const datosNormalizados = {
    marca: vehiculo.marca ?? vehiculo.brand ?? "",
    modelo: vehiculo.modelo ?? vehiculo.model ?? "",
    anio: vehiculo.anio ?? vehiculo.year ?? null,
    placa: vehiculo.placa ?? "",
    avaluo: vehiculo.avaluo ?? vehiculo.value ?? null,
    avaluoOriginal: vehiculo.avaluoOriginal ?? vehiculo.avaluo ?? vehiculo.value ?? null,
    esNuevo: vehiculo.esNuevo !== undefined ? Number(vehiculo.esNuevo) : (vehiculo.newVehicle ? 1 : 0),
    tipoUso: vehiculo.tipoUso ?? vehiculo.usage ?? "",
    submodelEqui: vehiculo.submodelEqui ?? vehiculo.submodel ?? "",
    tipo: vehiculo.tipo ?? vehiculo.type ?? "",
    idDealBitrix: vehiculo.idDealBitrix ?? null,
  };

  // Mapear campos visibles (solo si están vacíos)
  if (!current.marca && datosNormalizados.marca) {
    setValue("vehiculo.marca", datosNormalizados.marca, { shouldValidate: true });
  }
  if (!current.modelo && datosNormalizados.modelo) {
    setValue("vehiculo.modelo", datosNormalizados.modelo, { shouldValidate: true });
  }
  if (!current.placa && datosNormalizados.placa) {
    setValue("vehiculo.placa", datosNormalizados.placa, { shouldValidate: true });
  }

  // Año
  if (datosNormalizados.anio && !isNaN(Number(datosNormalizados.anio))) {
    setValue("vehiculo.anio", Number(datosNormalizados.anio), { shouldValidate: true });
  }

  // Avalúo
  if (datosNormalizados.avaluo && !isNaN(Number(datosNormalizados.avaluo))) {
    setValue("vehiculo.avaluo", Number(datosNormalizados.avaluo), { shouldValidate: true });
  }
  if (datosNormalizados.avaluoOriginal && !isNaN(Number(datosNormalizados.avaluoOriginal))) {
    setValue("vehiculo.avaluoOriginal", Number(datosNormalizados.avaluoOriginal), { shouldValidate: false });
  }

  // Campos ocultos/adicionales
  setValue("vehiculo.esNuevo", datosNormalizados.esNuevo, { shouldValidate: false });
  
  if (datosNormalizados.tipoUso) {
    setValue("vehiculo.tipoUso", datosNormalizados.tipoUso, { shouldValidate: false });
  }
  if (datosNormalizados.submodelEqui) {
    setValue("vehiculo.submodelEqui", datosNormalizados.submodelEqui, { shouldValidate: false });
  }
  if (datosNormalizados.tipo) {
    setValue("vehiculo.tipo", datosNormalizados.tipo, { shouldValidate: false });
  }
  if (datosNormalizados.idDealBitrix && !isNaN(Number(datosNormalizados.idDealBitrix))) {
    setValue("vehiculo.idDealBitrix", Number(datosNormalizados.idDealBitrix), { shouldValidate: false });
  }
};

/* ==================== HOOKS PERSONALIZADOS ==================== */
const useDebounce = (callback: () => void, delay: number, dependency: any) => {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    if (!dependency) return;

    timeoutRef.current = window.setTimeout(() => {
      callback();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [dependency, delay]);
};

const persistirEnLocalStorage = (values: FormValues) => {
  if (typeof window === "undefined") return;

  try {
    const vehiculoFormateado = {
      ...values.vehiculo,
      placa: formatearPlaca(values.vehiculo?.placa as unknown as string),
    };

    localStorage.setItem("clienteVehiculo", JSON.stringify(values.cliente));
    localStorage.setItem("vehiculo", JSON.stringify(vehiculoFormateado));
  } catch (error) {
    console.error("No se pudo guardar los datos en localStorage", error);
  }
};


/* ==================== COMPONENTE PRINCIPAL ==================== */
export const FormularioClienteVehiculo = () => {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [loadingCedula, setLoadingCedula] = useState(false);
  const [errorCedula, setErrorCedula] = useState<string | null>(null);
  const [loadingPlaca, setLoadingPlaca] = useState(false);
  const [errorPlaca, setErrorPlaca] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
  } = useForm<FormInputs, undefined, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente: {
        email: "",
        celular: "",
        fechaNacimiento: "2000-01-01",
        edad: "",
      },
      vehiculo: {
        tipoUso: "",
        esNuevo: 0,
      },
    },
  });

  const cedulaValue = watch("cliente.cedula");
  const placaValue = watch("vehiculo.placa");

  /* ==================== API CALLS ==================== */
  const buscarPersonaPorCedula = async (cedula: string) => {
    if (!cedula || cedula.length < 10) return;
    
    setErrorCedula(null);
    setLoadingCedula(true);

    try {
       const persona = await obtenerPersonaPorCedula(cedula);
    
    if (!persona) {
      throw new Error("No se encontró la persona");
    }
      mapearPersonaAFormulario(persona, setValue, getValues());
    } catch (error) {
      console.error("Error al buscar persona:", error);
      setErrorCedula("No se encontró información para la cédula ingresada");
    } finally {
      setLoadingCedula(false);
    }
  };

  const buscarVehiculoPorPlaca = async (placa: string) => {
    if (!placa || placa.length < 6) return;
    
    setErrorPlaca(null);
    setLoadingPlaca(true);

    try {
      const vehiculo = await obtenerVehiculoPorPlaca(placa.toUpperCase());
    
      if (!vehiculo) {
      throw new Error("No se encontró el vehículo");
    }
      mapearVehiculoAFormulario(vehiculo, setValue, getValues());
    } catch (error) {
      console.error("Error al buscar vehículo:", error);
      setErrorPlaca("No se encontró información para la placa ingresada");
    } finally {
      setLoadingPlaca(false);
    }
  };


  /* ==================== DEBOUNCE AUTOMÁTICO ==================== */
  useDebounce(
    () => buscarPersonaPorCedula(cedulaValue?.trim() || ""),
    600,
    cedulaValue
  );

  useDebounce(
    () => buscarVehiculoPorPlaca(placaValue?.trim().toUpperCase() || ""),
    600,
    placaValue
  );

  /* ==================== HANDLERS ==================== */
  const handleEdadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const edad = e.target.value;
    setValue("cliente.edad", edad);
    if (edad) {
      const fecha = calcularFechaDesdeEdad(edad);
      setValue("cliente.fechaNacimiento", fecha, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: FormValues) => {
    const fullName = [
      data.cliente.nombres,
      data.cliente.apellidos ||
        [data.cliente.primerApellido, data.cliente.segundoApellido].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    const payload = {
      identification: data.cliente.cedula ?? "",
      name: fullName || data.cliente.nombres || "",
      email: data.cliente.email ?? "",
      phone: data.cliente.celular ?? "",
      city: data.cliente.ciudad ?? "",
      age: data.cliente.edad ?? "",
      gender: data.cliente.genero ?? "",
      civilStatus: data.cliente.estadoCivil ?? "",
      brand: data.vehiculo.marca ?? "",
      model: data.vehiculo.modelo ?? "",
      year: data.vehiculo.anio ?? "",
      plate: data.vehiculo.placa ?? "",
      vehicleValue: data.vehiculo.avaluo ?? "",
      useOfVehicle: data.vehiculo.tipoUso ?? "",
    };

    console.log("Datos capturados del formulario:", { data, payload });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);

    persistirEnLocalStorage(data);

    try {
      const response = await fetch("/api/bitrix/putDealBitrix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let apiResult: unknown = null;
      try {
        apiResult = await response.json();
      } catch (error) {
        console.error("No se pudo parsear la respuesta de /api/bitrix/putDealBitrix:", error);
      }

      console.log("Respuesta de la API /api/bitrix/putDealBitrix:", {
        status: response.status,
        ok: response.ok,
        body: apiResult,
      });
    } catch (error) {
      console.error("Error al enviar datos a /api/bitrix/putDealBitrix:", error);
    }

    const queryString = typeof window !== "undefined" ? window.location.search : "";
    const destino = `/dashboard/comparador${queryString}`;
    router.push(destino);
  };

  /* ==================== RENDER ==================== */
  return (
    <div className="min-h-screen bg-gray-50 px-3 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-12">
      <div className="mx-auto w-full max-w-7xl">
       

        {/* Alert de éxito */}
        {submitted && (
          <Alert className="mx-auto mb-6 w-full max-w-2xl border-green-300 bg-green-50 sm:mb-8">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="font-medium text-green-800">
              ¡Formulario enviado exitosamente! Revisa la consola para ver los datos.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
            {/* ========== CARD VEHÍCULO ========== */}
            <Card className="shadow-md">
              <CardHeader className="border-b bg-white pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <Car className="h-5 w-5" /> Datos del Vehículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                {/* Placa */}
                <div className="space-y-2">
                  <Label htmlFor="placa" className="text-sm font-semibold text-gray-700">
                    Placa del Vehículo
                  </Label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <Input
                      id="placa"
                      {...register("vehiculo.placa")}
                      placeholder="PFH-7469"
                      className="h-11 w-full uppercase sm:flex-1"
                      onBlur={() => buscarVehiculoPorPlaca(getValues("vehiculo.placa")?.trim().toUpperCase() || "")}
                    />
                    <Button
                      type="button"
                      onClick={() => buscarVehiculoPorPlaca(getValues("vehiculo.placa")?.trim().toUpperCase() || "")}
                      className="h-11 w-full px-4 bg-rose-400 hover:bg-rose-500 sm:w-auto"
                      disabled={loadingPlaca}
                    >
                      {loadingPlaca ? "..." : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Los datos se llenan automáticamente al escribir
                  </p>
                  {errorPlaca && <p className="text-sm text-red-600">{errorPlaca}</p>}
                  {errors.vehiculo?.placa && (
                    <p className="text-sm text-red-600">{errors.vehiculo.placa.message}</p>
                  )}
                </div>

                {/* Marca y Modelo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marca" className="text-sm font-semibold text-gray-700">
                      Marca
                    </Label>
                    <Input
                      id="marca"
                      {...register("vehiculo.marca")}
                      placeholder="GEELY"
                      className="h-11"
                    />
                    {errors.vehiculo?.marca && (
                      <p className="text-sm text-red-600">{errors.vehiculo.marca.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modelo" className="text-sm font-semibold text-gray-700">
                      Modelo
                    </Label>
                    <Input
                      id="modelo"
                      {...register("vehiculo.modelo")}
                      placeholder="COOLRAY"
                      className="h-11"
                    />
                    {errors.vehiculo?.modelo && (
                      <p className="text-sm text-red-600">{errors.vehiculo.modelo.message}</p>
                    )}
                  </div>
                </div>

                {/* Año y Avalúo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="anio" className="text-sm font-semibold text-gray-700">
                      Año
                    </Label>
                    <Input
                      id="anio"
                      type="number"
                      {...register("vehiculo.anio")}
                      placeholder="2024"
                      className="h-11"
                    />
                    {errors.vehiculo?.anio && (
                      <p className="text-sm text-red-600">{errors.vehiculo.anio.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avaluo" className="text-sm font-semibold text-gray-700">
                      Valor del Vehículo
                    </Label>
                    <Input
                      id="avaluo"
                      type="number"
                      {...register("vehiculo.avaluo")}
                      placeholder="17000"
                      className="h-11"
                    />
                    {errors.vehiculo?.avaluo && (
                      <p className="text-sm text-red-600">{errors.vehiculo.avaluo.message}</p>
                    )}
                  </div>
                </div>

                {/* Tipo de Uso */}
                <div className="space-y-2">
                  <Label htmlFor="tipoUso" className="text-sm font-semibold text-gray-700">
                    Uso del Vehículo
                  </Label>
                  <select
                    id="tipoUso"
                    {...register("vehiculo.tipoUso")}
                    className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Particular">Particular</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Taxi">Taxi</option>
                    <option value="Uber">Uber</option>
                  </select>
                  {errors.vehiculo?.tipoUso && (
                    <p className="text-sm text-red-600">{errors.vehiculo.tipoUso.message}</p>
                  )}
                </div>

                {/* Campos ocultos */}
                <input type="hidden" {...register("vehiculo.esNuevo")} />
                <input type="hidden" {...register("vehiculo.avaluoOriginal")} />
                <input type="hidden" {...register("vehiculo.submodelEqui")} />
                <input type="hidden" {...register("vehiculo.tipo")} />
                <input type="hidden" {...register("vehiculo.idDealBitrix")} />
              </CardContent>
            </Card>

            {/* ========== CARD PROPIETARIO ========== */}
            <Card className="shadow-md">
              <CardHeader className="border-b bg-white pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <User className="h-5 w-5" /> Datos del Propietario
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {/* Cédula */}
                <div className="space-y-2">
                  <Label htmlFor="cedula" className="text-sm font-semibold text-gray-700">
                    Cédula
                  </Label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <Input
                      id="cedula"
                      {...register("cliente.cedula")}
                      placeholder="1753035664"
                      className="h-11 w-full sm:flex-1"
                      onBlur={() => buscarPersonaPorCedula(getValues("cliente.cedula")?.trim() || "")}
                    />
                    <Button
                      type="button"
                      onClick={() => buscarPersonaPorCedula(getValues("cliente.cedula")?.trim() || "")}
                      className="h-11 w-full px-4 bg-slate-400 hover:bg-slate-500 sm:w-auto"
                      disabled={loadingCedula}
                    >
                      {loadingCedula ? "..." : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Los datos se llenan automáticamente al escribir
                  </p>
                  {errorCedula && <p className="text-sm text-red-600">{errorCedula}</p>}
                  {errors.cliente?.cedula && (
                    <p className="text-sm text-red-600">{errors.cliente.cedula.message}</p>
                  )}
                </div>

                {/* Nombres y Apellidos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombres" className="text-sm font-semibold text-gray-700">
                      Nombres
                    </Label>
                    <Input
                      id="nombres"
                      {...register("cliente.nombres")}
                      placeholder="JUAN FERNANDO"
                      className="h-11"
                    />
                    {errors.cliente?.nombres && (
                      <p className="text-sm text-red-600">{errors.cliente.nombres.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellidos" className="text-sm font-semibold text-gray-700">
                      Apellidos
                    </Label>
                    <Input
                      id="apellidos"
                      {...register("cliente.apellidos")}
                      placeholder="CALVACHE HERNANDEZ"
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Celular */}
                <div className="space-y-2">
                  <Label htmlFor="celular" className="text-sm font-semibold text-gray-700">
                    Teléfono
                  </Label>
                  <Input
                    id="celular"
                    {...register("cliente.celular")}
                    placeholder="0987748808"
                    className="h-11"
                  />
                  {errors.cliente?.celular && (
                    <p className="text-sm text-red-600">{errors.cliente.celular.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("cliente.email")}
                    placeholder="correo@ejemplo.com"
                    className="h-11"
                  />
                  {errors.cliente?.email && (
                    <p className="text-sm text-red-600">{errors.cliente.email.message}</p>
                  )}
                </div>

                {/* Edad y Género */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edad" className="text-sm font-semibold text-gray-700">
                      Edad
                    </Label>
                    <Input
                      id="edad"
                      type="number"
                      {...register("cliente.edad")}
                      onChange={handleEdadChange}
                      placeholder="25"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genero" className="text-sm font-semibold text-gray-700">
                      Género
                    </Label>
                    <select
                      id="genero"
                      {...register("cliente.genero")}
                      className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                {/* Estado Civil y Ciudad */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="estadoCivil" className="text-sm font-semibold text-gray-700">
                      Estado Civil
                    </Label>
                    <select
                      id="estadoCivil"
                      {...register("cliente.estadoCivil")}
                      className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Soltero">Soltero</option>
                      <option value="Casado">Casado</option>
                      <option value="Divorciado">Divorciado</option>
                      <option value="Viudo">Viudo</option>
                      <option value="Union de hecho">Unión de hecho</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ciudad" className="text-sm font-semibold text-gray-700">
                      Ciudad
                    </Label>
                    <Input
                      id="ciudad"
                      {...register("cliente.ciudad")}
                      placeholder="QUITO"
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Campos ocultos del cliente */}
                <input type="hidden" {...register("cliente.fechaNacimiento")} />
                <input type="hidden" {...register("cliente.primerApellido")} />
                <input type="hidden" {...register("cliente.segundoApellido")} />
                <input type="hidden" {...register("cliente.provincia")} />
                <input type="hidden" {...register("cliente.region")} />
                <input type="hidden" {...register("cliente.codMapfre")} />
              </CardContent>
            </Card>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              className="h-12 w-full px-8 text-base sm:w-auto"
            >
              Limpiar
            </Button>
            <Button
              type="submit"
              className="h-12 w-full px-8 text-base bg-blue-600 hover:bg-blue-700 sm:w-auto"
            >
              Cotizar Seguro
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
