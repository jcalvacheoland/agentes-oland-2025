import { AseguradorasLogo } from "@/configuration/constants";
type StaticPlan = {
  name: string;
  img: string;
  phone: string;
};


const STATIC_PLANS: StaticPlan[] = [
  {
    name: "Generali",
    img: AseguradorasLogo.find((logo) => logo.name.toLowerCase().includes("generali".toLowerCase()))?.img || "",
    phone: "099 1234 5678",
  },
  {
    name: "Mapfre",
    img:  AseguradorasLogo.find((logo) => logo.name.toLowerCase().includes("mapfre".toLowerCase()))?.img || "",
    phone: "099 1234 5678",
  },
  {
    name: "Vaz Seguros",
    img: AseguradorasLogo.find((logo) => logo.name.toLowerCase().includes("vaz".toLowerCase()))?.img || "",
    phone: "099 1234 5678",
  },
  {
    name: "AIG",
    img: AseguradorasLogo.find((logo) => logo.name.toLowerCase().includes("aig".toLowerCase()))?.img || "",
    phone: "099 1234 5678",
  },
];

export const StaticPlanCard = () => {
  return (
    <div className="grid gap-4 grid-cols-1 font-outfit ">
      {STATIC_PLANS.map((plan) => (
        <article
          key={plan.name}
          className="relative flex flex-col gap-6 p-6 border-2 border-gray-400 rounded-xl border-border bg-card transition-all hover:shadow-lg"
        >
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-start min-h-[130px]">
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border border-border">
                <img src={plan.img}  alt={plan.name} />
              </div>
             
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-xl font-bold uppercase text-foreground">
                  Planes con {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Para obtener planes con estas aseguradoras, contáctate con nuestro equipo.
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Teléfono: {plan.phone}</p>
              </div>
            </div>

          
          </div>
        </article>
      ))}
    </div>
  );
};
