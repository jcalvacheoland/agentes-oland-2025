import { searchJustCotizacionByBitrixId } from "@/actions/cotizaciones.actions";
import { ComparadorWrapperPostForm } from "./components/ComparadorWrapper";
import { IPlanRequest } from "@/interfaces/interfaces.type";
import { formatoPlaca } from "@/lib/utils";

export default async function PageComparadorPostForm({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cotizacion = await searchJustCotizacionByBitrixId(slug);

  const planRequest: IPlanRequest = {
    plate: formatoPlaca(cotizacion?.plate),
    submodelEqui: 50012318,
    brand: cotizacion?.brand || "",
    model: cotizacion?.model || "",
    year: cotizacion?.year || 0,
    vehicleValue: cotizacion?.vehicleValue || 0,
    type: cotizacion?.type || "",
    subtype: "",
    extras: cotizacion?.extras || 0,
    newVehicle: cotizacion?.newVehicle || 0,
    city: cotizacion?.city || "",
    identification: cotizacion?.identification || "",
    name: cotizacion?.name || "",
    firstLastName: cotizacion?.firstLastName || "",
    secondLastName: cotizacion?.secondLastName || "",
    gender: cotizacion?.gender || "",
    civilStatus: cotizacion?.civilStatus || "",
    birthdate: cotizacion?.birthdate || "",
    age: cotizacion?.age || 0,
    cityCodeMapfre: cotizacion?.cityCodeMapfre || 0,
    useOfVehicle: cotizacion?.useOfVehicle || "",
    chubb_mm: cotizacion?.chubb_mm || "AD",
  };

  return (
    <div>
      <ComparadorWrapperPostForm
        slug={slug}
        planRequest={planRequest}
        cotizacion={cotizacion}
      ></ComparadorWrapperPostForm>
    </div>
  );
}
