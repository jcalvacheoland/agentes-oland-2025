import { getBitrixDeal } from "@/actions/bitrixActions";
import { getCotizacionByBitrixId } from "@/actions/cotizaciones.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  User,
  CreditCard,
  MapPin,
  Heart,
  Users,
  File,
  Car,
} from "lucide-react";
import { PlanSelector } from "@/components/PlanSelector";

const typography = {
  page: "max-w-7xl mx-auto p-6 space-y-6 font-[var(--font-outfit)] text-slate-800 ",
  header: "space-y-2",
  title: "text-2xl font-semibold text-slate-900 tracking-tight",
  sectionTitle:
    "flex items-center gap-2 text-2xl font-semibold text-slate-900 tracking-tight",
  label: "text-xs font-semibold uppercase tracking-wide text-slate-500",
  value: "text-base font-medium text-slate-900",
  detail: "text-sm text-slate-700",
  muted: "text-sm text-slate-500",
};

interface DealPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DealPage(props: DealPageProps) {
  const { slug } = await props.params;

  const response = await getBitrixDeal(slug);

  if (!response.ok || !response.deal) {
    return (
      <div className={`${typography.page} py-12`}>
        Error: {response.error || "No se encontro la cotizacion en Bitrix"}
      </div>
    );
  }

  const deal = response.deal;
  const cotizacionResponse = await getCotizacionByBitrixId(deal.ID);

  if (!cotizacionResponse.ok || !cotizacionResponse.cotizacion) {
    return (
      <div className={`${typography.page} py-12`}>
        Error:{" "}
        {cotizacionResponse.error ||
          "No se encontro la cotizacion asociada en la base de datos"}
      </div>
    );
  }

  const cotizacion = cotizacionResponse.cotizacion!;

  const clienteItems = [
    { icon: User, label: "Nombre", value: deal.UF_CRM_1675696681 },
    {
      icon: CreditCard,
      label: "Cedula / Identificacion",
      value: deal.UF_CRM_1699991426,
    },
    { icon: Users, label: "Edad", value: deal.UF_CRM_1747676789932 },
    { icon: MapPin, label: "Ciudad", value: deal.UF_CRM_1758140561898 },
    { icon: Heart, label: "Estado civil", value: deal.UF_CRM_1757969782406 },
    { icon: Users, label: "Genero", value: deal.UF_CRM_1758140844163 },
  ];

  const vehiculoItems = [
    { label: "Marca", value: deal.UF_CRM_1708442550726 },
    { label: "Modelo", value: deal.UF_CRM_1708442569166 },
    { label: "Año", value: deal.UF_CRM_1708442612728 },
    { label: "Placa", value: formatoPlaca(deal.UF_CRM_1708442675536) },
    {
      label: "Valor sugerido del vehiculo",
      value: formatValorVehiculo(deal.UF_CRM_1757947153789),
    },
  ];
  const stageLabels: Record<string, string> = {
    "C24:NEW": "Nuevo",
    "C24:PREPARATION": "Preparación",
    "C24:UC_ZCRTSB": "Inspección",
    "C24:PREPAYMENT_INVOIC": "Inspección favorable",
    "C24:UC_87UXF3": "Formulario de vinculación",
    "C24:EXECUTING": "Orden de emisión",
    "C24:UC_CJKKJS": "Emitida",
    "C24:UC_GFUHD0": "Despacho de emisión",
    "C24:UC_9TDBGH": "Cobranza",
    "C24:UC_D2MRZM": "Pagado",
    "C24:UC_XMLGTG": "Comisión",
    WON: "Cerrada",
  };

  function formatValorVehiculo(valor?: string) {
    if (!valor) return "No especificado";

    // Ejemplo de valor: "17000|USD"
    const [numStr] = valor.split("|");
    const num = Number(numStr);

    if (isNaN(num)) return valor;

    // Formato: $17,000
    return `$${num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }

  function formatoPlaca(placa?: string) {
    if (!placa) return "No especificado xd";
    // Eliminar espacios y convertir a mayúsculas
    const limpia = placa.replace(/\s+/g, "").toUpperCase();
    const match = limpia.match(/^([A-Z]{3})(\d{3,4})$/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }

    // Si no coincide, devolver igual en mayúsculas
    return limpia;
  }

  return (
    <div className={typography.page}>
      <div className={typography.header}>
        <h1 className={typography.title}>{deal.TITLE}</h1>
        <p
          className={`
    inline-flex items-center justify-center 
    px-3 py-1.5 rounded-full 
    text-sm font-medium
    text-white
    bg-azul-oland-100 
    shadow-sm
    transition-all
    hover:opacity-90
  `}
        >
          <span className="font-medium text-white">Etapa:</span>{" "}
          <span className="ml-1">
            {stageLabels[deal.STAGE_ID] || deal.STAGE_ID}
          </span>
        </p>
      </div>

      

      <section className="grid  grid-cols-1 grid-flow-col grid-rows-3 md:grid-cols-2 md:grid-rows-none  space-x-4 gap-6">

       {/*  datos del cliente */}

        <Card className="w-auto  md:row-span-2 h-fit ">
          <CardHeader>
            <CardTitle className={typography.sectionTitle}>
              <User className="w-5 h-5" />
              Datos del cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clienteItems.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <Icon className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`${typography.label} mb-1`}>{label}</p>
                  <p className={`${typography.value} break-words`}>
                    {value || "No especificado"}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>


        {/* datos del vehiculo */}
        <Card className="w-full h-fit  ">
          <CardHeader>
            <CardTitle className={typography.sectionTitle}>
              <Car className="w-5 h-5" />
              Datos del vehiculo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid  md:grid-cols-3  gap-6 bg ">
              {vehiculoItems.map(({ label, value }) => (
                <div
                  key={label}
                  className="space-y-1  bg-slate-50 hover:bg-slate-100 transition-colors p-4 rounded-lg"
                >
                  <p className={typography.label}>{label}</p>
                  <p className={typography.value}>
                    {value || "No especificado"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


        {/*  Planes comparados */}
        <Card className="w-full  space-y-0">
          <CardHeader className="pb-2">
            <CardTitle className={typography.sectionTitle}>
              <File className="w-5 h-5" />
              Planes comparados
            </CardTitle>
            <h2>Escoge 1 de los planes comparados</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <PlanSelector
              dealId={deal.ID}
              plans={cotizacion.planesComparados ?? []}
            />
          </CardContent>
        </Card>
        
      </section>

      <div>
        <div>
          <Button asChild variant="oland" className="cursor-pointer">
            <Link href={`/${slug}/comparador`}>Volver a Comparar Planes</Link>
          </Button>
        </div>
      </div>

           
      

    
    </div>
  );
}
