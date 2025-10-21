"use client";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Car, User, Search, Loader2 } from "lucide-react";
import { obtenerPersonaPorCedula, obtenerVehiculoPorPlaca } from '@/lib/services/api';
import { SelectUsoVehiculo } from "./inputs/selectInput";
import { SelectEstadoCivil } from "./inputs/selectInputEstadoCivil";
import {SelectGenero} from "./inputs/selectInputGenero";
import { SelectCiudad } from "./inputs/selectInputCiudad";
import { createCotizacion } from "@/actions/cotizaciones.actions"; 
import { calcularEdad, calcularFechaDesdeEdad, normalizarTexto, formatearPlaca } from "@/lib/utilsForms";

/* ==================== SCHEMAS ==================== */
const clienteSchema = z.object({
  cedula: z.string().min(10, "La cédula debe tener al menos 10 caracteres"),
  nombres: z.string().min(2, "Ingrese los nombres"),
  apellidos: z.string().min(2, "Ingrese los apellidos"),
  primerApellido: z.string(),
  segundoApellido: z.string(),
  fechaNacimiento: z.string(),
  edad: z.string().max(2, "Edad no válida").min(1, "Edad no válida"),
  genero: z.string().min(2, "El género es obligatorio"),
  estadoCivil: z.string().min(2, "El estado civil es obligatorio"),
  email: z.union([z.string().email("Correo electrónico inválido"), z.literal("")]).optional(),
  celular: z.union([z.string().min(10, "El celular debe tener al menos 10 dígitos"), z.literal("")]).optional(),
  ciudad: z.string().min(2, "La ciudad es obligatoria"),
  provincia: z.string().optional(),
  region: z.string().optional(),
  codMapfre: z.coerce.number().optional(),
});

const vehiculoSchema = z.object({
  marca: z.string().optional(),
  modelo: z.string().optional(),
  anio: z.coerce.number().min(1900, "Campo no válido").max(2026).optional(),
  placa: z.string().min(6, "Placa inválida").optional(),
  avaluo: z.coerce.number().min(0).optional(),
  avaluoOriginal: z.coerce.number().optional(),
  tipo: z.string().optional(),
  tipoUso: z.string().min(2, "El tipo de uso es obligatorio"),
  esNuevo: z.coerce.number().optional(),
  submodelEqui: z.string().optional(),
  idDealBitrix: z.coerce.number().optional(),
  idCotizacion: z.string().optional(),
});

const formSchema = z.object({
  cliente: clienteSchema,
  vehiculo: vehiculoSchema,
});

type FormSchema = typeof formSchema;
type FormValues = z.infer<FormSchema>;
type FormInputs = z.input<FormSchema>;
type VehiculoAutoFillField = "marca" | "modelo" | "anio" | "avaluo";
type VehiculoAutoFillMap = Partial<Record<VehiculoAutoFillField, boolean>>;

const generarIdCotizacion = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const randomSegment = Math.random().toString(36).slice(2, 10) || "xxxx";
  return `cotizacion-${Date.now()}-${randomSegment}`;
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
  if (datosNormalizados.nombres) {
    setValue("cliente.nombres", datosNormalizados.nombres, { shouldValidate: true });
  }
  if (datosNormalizados.apellidos) {
    setValue("cliente.apellidos", datosNormalizados.apellidos, { shouldValidate: false });
  }
  if (!current.celular && datosNormalizados.celular) {
    setValue("cliente.celular", datosNormalizados.celular, { shouldValidate: true });
  }
  if (!current.email && datosNormalizados.email) {
    setValue("cliente.email", datosNormalizados.email, { shouldValidate: true });
  }
  if (datosNormalizados.ciudad) {
    setValue("cliente.ciudad", datosNormalizados.ciudad, { shouldValidate: false });
  }
  if (datosNormalizados.cedula) {
    setValue("cliente.cedula", datosNormalizados.cedula, { shouldValidate: true });
  }

  // Mapear campos ocultos/adicionales (siempre se sobrescriben)
  setValue("cliente.primerApellido", datosNormalizados.primerApellido, { shouldValidate: false });
  setValue("cliente.segundoApellido", datosNormalizados.segundoApellido, { shouldValidate: false });
  setValue("cliente.provincia", datosNormalizados.provincia, { shouldValidate: false });
  setValue("cliente.region", datosNormalizados.region, { shouldValidate: false });
  
  if (datosNormalizados.estadoCivil) {
    setValue("cliente.estadoCivil", datosNormalizados.estadoCivil, { shouldValidate: false });
  }
  if (datosNormalizados.genero) {
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

const mapearVehiculoAFormulario = (
  vehiculo: any,
  setValue: any,
  _currentValues: any
): VehiculoAutoFillField[] => {
  const autoFilledFields: VehiculoAutoFillField[] = [];

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
    idCotizacion: vehiculo.idCotizacion ?? null,
  };

  // Mapear campos visibles (solo si están vacíos)
  if (datosNormalizados.marca) {
    setValue("vehiculo.marca", datosNormalizados.marca, { shouldValidate: true });
    autoFilledFields.push("marca");
  }
  if (datosNormalizados.modelo) {
    setValue("vehiculo.modelo", datosNormalizados.modelo, { shouldValidate: true });
    autoFilledFields.push("modelo");
  }
  if (datosNormalizados.placa) {
    setValue("vehiculo.placa", datosNormalizados.placa, { shouldValidate: true });
  }

  // Año
  if (!isNaN(Number(datosNormalizados.anio))) {
    setValue("vehiculo.anio", Number(datosNormalizados.anio), { shouldValidate: true });
    autoFilledFields.push("anio");
  }

  // Avalúo
  if (!isNaN(Number(datosNormalizados.avaluo))) {
    setValue("vehiculo.avaluo", Number(datosNormalizados.avaluo), { shouldValidate: true });
    autoFilledFields.push("avaluo");
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
  if (datosNormalizados.idCotizacion) {
    setValue("vehiculo.idCotizacion", String(datosNormalizados.idCotizacion), { shouldValidate: false });
  }

  return autoFilledFields;
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
    let existingId: string | null = null;

    try {
      const storedVehiculo = localStorage.getItem("vehiculo");
      if (storedVehiculo) {
        const parsedVehiculo = JSON.parse(storedVehiculo) as { idCotizacion?: unknown };
        if (
          parsedVehiculo &&
          typeof parsedVehiculo.idCotizacion === "string" &&
          parsedVehiculo.idCotizacion.trim() !== ""
        ) {
          existingId = parsedVehiculo.idCotizacion;
        }
      }
    } catch (readError) {
      console.warn("No se pudo leer vehiculo existente de localStorage", readError);
    }

    const vehiculoFormateado = {
      ...values.vehiculo,
      placa: formatearPlaca(values.vehiculo?.placa as unknown as string),
    };

    const {
      idDealBitrix: _,
      idCotizacion: formIdCotizacion,
      ...vehiculoSinBitrix
    } = vehiculoFormateado ?? {};

    const idCotizacion =
      existingId ??
      (typeof formIdCotizacion === "string" && formIdCotizacion.trim() !== ""
        ? formIdCotizacion
        : generarIdCotizacion());

    const vehiculoParaGuardar = {
      ...vehiculoSinBitrix,
      idCotizacion,
    };

    localStorage.setItem("clienteVehiculo", JSON.stringify(values.cliente));
    localStorage.setItem("vehiculo", JSON.stringify(vehiculoParaGuardar));
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
  const [autoFilledVehiculo, setAutoFilledVehiculo] = useState<VehiculoAutoFillMap>({});


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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

  useEffect(() => {
    register("cliente.genero");
    register("cliente.estadoCivil");
    register("cliente.ciudad");
    register("vehiculo.tipoUso");
    register("vehiculo.idCotizacion");
  }, [register]);

  const cedulaValue = watch("cliente.cedula");
  const placaValue = watch("vehiculo.placa");
  const tipoUsoValue = watch("vehiculo.tipoUso");
  const generoValue = watch("cliente.genero");
  const estadoCivilValue = watch("cliente.estadoCivil");
  const ciudadValue = watch("cliente.ciudad");

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
      const camposAutocompletados = mapearVehiculoAFormulario(
        vehiculo,
        setValue,
        getValues()
      );
      if (camposAutocompletados.length) {
        setAutoFilledVehiculo((prev) => ({
          ...prev,
          ...camposAutocompletados.reduce<VehiculoAutoFillMap>((acc, field) => {
            acc[field] = true;
            return acc;
          }, {}),
        }));
      }
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

  const handleReset = () => {
    reset();
    setAutoFilledVehiculo({});
  };

  const onSubmit = async (data: FormValues) => {
  const fullName = [
    data.cliente.nombres,
    data.cliente.apellidos ||
      [data.cliente.primerApellido, data.cliente.segundoApellido]
        .filter(Boolean)
        .join(" "),
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

/*   console.log("Datos capturados del formulario:", { data, payload }); */

  setSubmitted(true);
  setTimeout(() => setSubmitted(false), 3000);

  persistirEnLocalStorage(data);

  try {
    // 🟨 1️⃣ Primero: crear el DEAL en Bitrix y obtener su ID
    const response = await fetch("/api/bitrix/putDealBitrix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let apiResult: any = null;
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

    let bitrixDealId: number | null = null;

    if (response.ok && apiResult && typeof apiResult === "object") {
      const dealIdValue = Number(apiResult.dealId ?? NaN);
      if (!Number.isNaN(dealIdValue) && dealIdValue > 0) {
        bitrixDealId = dealIdValue;
        console.log("✅ Deal creado en Bitrix con ID:", bitrixDealId);
      }
    }

    // 🟩 2️⃣ Luego: guardar en tu base de datos, incluyendo el bitrixDealId
    const result = await createCotizacion({
      plate: data.vehiculo.placa ?? "",
      submodelEqui: Number(data.vehiculo.submodelEqui) || 0,
      brand: data.vehiculo.marca ?? "",
      model: data.vehiculo.modelo ?? "",
      year: Number(data.vehiculo.anio) || 0,
      vehicleValue: Number(data.vehiculo.avaluo) || 0,
      type: data.vehiculo.tipo ?? "",
      subtype: "",
      extras: 0,
      newVehicle: Number(data.vehiculo.esNuevo) || 0,
      city: data.cliente.ciudad ?? "",
      identification: data.cliente.cedula ?? "",
      name: fullName || data.cliente.nombres || "",
      firstLastName: data.cliente.primerApellido ?? "",
      secondLastName: data.cliente.segundoApellido ?? "",
      gender: data.cliente.genero ?? "",
      civilStatus: data.cliente.estadoCivil ?? "",
      birthdate: data.cliente.fechaNacimiento ?? "",
      age: Number(data.cliente.edad) || 0,
      cityCodeMapfre: Number(data.cliente.codMapfre) || 1701,
      useOfVehicle: data.vehiculo.tipoUso ?? "",
      chubb_mm: "AD",
      bitrixDealId: bitrixDealId ? String(bitrixDealId) : "",
    });

    if (!result.success) {
      console.error("❌ Error guardando cotización:", result.error);
      alert("Error guardando la cotización en la BD");
      return;
    }
    
    const idCotizacionBitrix = result.data?.id ;
    console.log("✅ Cotización guardada en BD con id:", idCotizacionBitrix);

    const idCotizacionBitrix2 = result.data?.bitrixDealId ;

    if (typeof window !== "undefined" && idCotizacionBitrix2) {
      localStorage.setItem("idCotizacion2", String(idCotizacionBitrix2));
    }

    // 🟩 3️⃣ Guardar SOLO el idCotizacion en localStorage
    if (typeof window !== "undefined" && idCotizacionBitrix) {
      localStorage.setItem("idCotizacion", String(idCotizacionBitrix));
    }

    // 🟩 4️⃣ Redirigir al comparador con idCotizacion
    const destino = `/dashboard/comparador`;
    router.push(destino);

  } catch (error) {
    console.error("Error general al guardar y redirigir:", error);
    alert("Ocurrió un error al guardar la cotización.");
  }
};


  /* ==================== RENDER ==================== */
  return (
    <div className="relative min-h-screen px-3 py-6 sm:px-6 lg:px-10">
      {(submitted || isSubmitting) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-azul-oland-100"></div>
            <p className="mt-4 text-gray-800 font-semibold">Estamos cotizando tu vehículo...</p>
          </div>
        </div>
      )}
      <div className="mx-auto w-full max-w-7xl">
       
      

        <form  onSubmit={handleSubmit(onSubmit)}>
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
                Placa del vehículo
                  </Label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <Input
                      id="placa"
                      {...register("vehiculo.placa")}
                      placeholder="PFQ1234"
                      className="h-11 w-full uppercase sm:flex-1 text-black"
                      onBlur={() => buscarVehiculoPorPlaca(getValues("vehiculo.placa")?.trim().toUpperCase() || "")}
                    />
                    <Button
                      type="button"
                      onClick={() => buscarVehiculoPorPlaca(getValues("vehiculo.placa")?.trim().toUpperCase() || "")}
                      className="h-11 w-full px-4 bg-rojo-oland-100 hover:bg-red-500 sm:w-auto"
                      disabled={loadingPlaca}
                    >
                      {loadingPlaca ? "..." : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                Los datos se completan automáticamente al escribir.
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
                      autoComplete="false"
                      id="marca"
                      {...register("vehiculo.marca")}
                      placeholder="AUDI"
                      className={cn("h-11", autoFilledVehiculo.marca && "autofill-lock")}
                      readOnly={!!autoFilledVehiculo.marca}
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
                     autoComplete="false"
                      id="modelo"
                      {...register("vehiculo.modelo")}
                      placeholder="A4"
                      className={cn("h-11", autoFilledVehiculo.marca && "autofill-lock")}
                      readOnly={!!autoFilledVehiculo.marca}
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
                     autoComplete="false"
                      id="anio"
                      type="number"
                      {...register("vehiculo.anio")}
                      placeholder="2024"
                      className={cn("h-11", autoFilledVehiculo.marca && "autofill-lock")}
                      readOnly={!!autoFilledVehiculo.marca}
                    />
                    {errors.vehiculo?.anio && (
                      <p className="text-sm text-red-600">{errors.vehiculo.anio.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avaluo" className="text-sm font-semibold text-gray-700">
                 Valor del vehículo (sugerido)
                    </Label>
                    <Input
                      
                     autoComplete="false"
                      id="avaluo"
                      type="number"
                      {...register("vehiculo.avaluo")}
                      placeholder="15000"
                      className={cn("h-11", autoFilledVehiculo.marca && "autofill-lock")}
                    
           
                    />
                    {errors.vehiculo?.avaluo && (
                      <p className="text-sm text-red-600">{errors.vehiculo.avaluo.message}</p>
                    )}
                  </div>
                </div>

                {/* Tipo de Uso */}
                <SelectUsoVehiculo
                  errors={errors}
                  setValue={setValue}
                  value={tipoUsoValue}
                />


                {/* Campos ocultos */}
                <input type="hidden" {...register("vehiculo.esNuevo")} />
                <input type="hidden" {...register("vehiculo.avaluoOriginal")} />
                <input type="hidden" {...register("vehiculo.submodelEqui")} />
                <input type="hidden" {...register("vehiculo.tipo")} />
                <input type="hidden" {...register("vehiculo.idDealBitrix")} />
                <input type="hidden" {...register("vehiculo.idCotizacion")} />
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
                      placeholder="1701234567"
                      className="h-11 w-full sm:flex-1"
                      onBlur={() => buscarPersonaPorCedula(getValues("cliente.cedula")?.trim() || "")}
                    />
                    <Button
                      type="button"
                      onClick={() => buscarPersonaPorCedula(getValues("cliente.cedula")?.trim() || "")}
                      className="h-11 w-full px-4 bg-azul-oland-100 hover:bg-slate-500 sm:w-auto"
                      disabled={loadingCedula}
                    >
                      {loadingCedula ? "..." : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                Los datos se completan automáticamente al escribir.
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
                      placeholder="JOHN CARLOS"
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
                      placeholder="DOE PEREZ"
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Celular */}
                <div className="space-y-2">
                  <Label htmlFor="celular" className="text-sm font-semibold text-gray-700">
              Celular (opcional)
                  </Label>
                  <Input
                    id="celular"
                    {...register("cliente.celular")}
                    placeholder="0991234567"
                    className="h-11"
                  />
                  {errors.cliente?.celular && (
                    <p className="text-sm text-red-600">{errors.cliente.celular.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Correo electrónico (opcional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("cliente.email")}
                    placeholder="correo@ejemplo.com"
                    className="h-11 "
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
                      
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <SelectGenero
                      errors={errors}
                      setValue={setValue}
                      value={generoValue}
                    />
                  </div>
                </div>

                {/* Estado Civil y Ciudad */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <SelectEstadoCivil
                      errors={errors}
                      setValue={setValue}
                      value={estadoCivilValue}
                    />

                  </div>
                  <div className="space-y-2">
                    <SelectCiudad
                      errors={errors}
                      setValue={setValue}
                      value={ciudadValue}
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
              onClick={handleReset}
              className="h-12 w-full rounded-full px-8 text-base sm:w-auto"
              disabled={isSubmitting}
            >
              Limpiar
            </Button>
            <Button
              type="submit"
              variant={"oland"}
              className="h-12 w-full px-8 text-base sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Estamos cotizando tu vehículo...
                </span>
              ) : (
                "Cotizar Vehículo"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

