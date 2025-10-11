"use client";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  FormProvider,
  useForm,
  type Resolver,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, type FormValues } from "@/schemas/formSchemas";
import { PersonSection } from "@/app/(dashboard)/dashboard/components/form/sections/personSection";
import { VehicleSection } from "@/app/(dashboard)/dashboard/components/form/sections/vehicleSection";
import { createDeal } from "@/lib/services/dealsService";
import { sendPlanRequest } from "@/lib/services/planService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export const CotizadorForm = () => {
  const router = useRouter();

  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isLoadingDeal, setIsLoadingDeal] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    message: string;
    dealId?: string;
  } | null>(null);

  // Resolver casteado para alinear tipos (evita unknown en opcionales)
  const resolver = zodResolver(formSchema) as unknown as Resolver<FormValues, any, FormValues>;

  const methods = useForm<FormValues>({
    resolver,
    defaultValues: {
      // Person
      name: "",
      email: "",
      phone: "",
      identification: "",
      city: "",
      age: undefined,
      gender: undefined,
      civilStatus: undefined,
      firstLastName: undefined,
      secondLastName: undefined,
      birthdate: undefined,
      useOfVehicle: "particular",
      // Vehicle
      plate: "",
      model: "",
      brand: "",
      year: new Date().getFullYear(),
      vehicleValue: 0,
      type: undefined,
      subtype: undefined,
      submodelEqui: undefined,
      extras: 0,
      newVehicle: 0,
    },
    mode: "onBlur",
  });

  const { handleSubmit, reset } = methods;

 

  // 1) CREAR DEAL + COTIZAR
  const onSubmitDealAndPlan: SubmitHandler<FormValues> = useCallback(async (data) => {
    setIsLoadingDeal(true);
    setSubmitMessage(null);

    try {
      const [dealResult, planResp] = await Promise.all([
        createDeal({ ...data }),
        sendPlanRequest({ ...data }),
      ]);

      const hadAnyOk =
        Array.isArray((planResp as any)?.results) &&
        (planResp as any).results.some((r: any) => r?.ok === true);

      setSubmitMessage({
        type: hadAnyOk ? "success" : "error",
        message: hadAnyOk
          ? "¡Deal creado y cotización lista!"
          : "Deal creado, pero no hubo resultados de aseguradoras.",
        dealId: (dealResult as any)?.dealId,
      });

      reset();
      router.push("/dashboard/comparador");
      window.setTimeout(() => setSubmitMessage(null), 10000);
    } catch (error: any) {
      setSubmitMessage({
        type: "error",
        message:
          error?.body?.error ||
          error?.message ||
          "Error al crear Deal/cotizar. Intenta nuevamente.",
      });
      window.setTimeout(() => setSubmitMessage(null), 8000);
    } finally {
      setIsLoadingDeal(false);
    }
  }, [reset, router]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Formulario de Cotización</h1>
        <p className="text-gray-600 mt-2">
          Complete todos los campos para recibir su cotización
        </p>
      </div>

      {submitMessage && (
        <Alert
          className={`mb-6 ${
            submitMessage.type === "success"
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50"
          }`}
        >
          <div className="flex items-center gap-2">
            {submitMessage.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <AlertDescription
              className={
                submitMessage.type === "success" ? "text-green-800" : "text-red-800"
              }
            >
              {submitMessage.message}
              {submitMessage.dealId && (
                <span className="mt-1 font-semibold block">
                  ID de seguimiento: {submitMessage.dealId}
                </span>
              )}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <FormProvider {...methods}>
        {/* El form valida. Los botones llaman a su propio handleSubmit(handler) */}
        <form className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PersonSection />
            <VehicleSection />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           

            {/* Botón 2: Crear Deal + Cotizar */}
            <Button
              type="button"
              className="w-full h-12 text-lg font-semibold"
              onClick={handleSubmit(onSubmitDealAndPlan)}
              disabled={isLoadingPlan || isLoadingDeal}
            >
              {isLoadingDeal ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creando Deal + Cotizando...
                </span>
              ) : (
                "Crear Deal + Cotizar"
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default CotizadorForm;
