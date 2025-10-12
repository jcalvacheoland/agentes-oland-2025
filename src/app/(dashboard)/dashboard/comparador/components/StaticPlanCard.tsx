interface StaticPlanCardProps {

}
const StaticPlanCardData=[{
 name:"ZURICH - PLAN PRO",
 img:"/logo-zurich.png",
 rating:5,
 monthlyPrice:116.78,
 phone:"55 1234 5678",
},

 
]
export const StaticPlanCard=()=> {
  return (
    <div className="relative p-6 border-2 rounded-xl bg-card hover:border-azul-oland-100 transition-all hover:shadow-lg">
      

      <div className="grid grid-cols-[auto_1fr_auto] gap-6 items-start">
        {/* Columna izquierda: logo / nombre aseguradora */}
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border border-border">
            <span className="text-2xl font-bold text-muted-foreground">ZU</span>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">ZURICH</div>
            <div className="flex gap-0.5 mt-1">
              <svg
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09L5.82 12.18.94 8.41l6.09-.88L10 2.5l2.97 5.03 6.09.88-4.88 3.77 1.7 5.91z" />
              </svg>
              <svg
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09L5.82 12.18.94 8.41l6.09-.88L10 2.5l2.97 5.03 6.09.88-4.88 3.77 1.7 5.91z" />
              </svg>
              <svg
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09L5.82 12.18.94 8.41l6.09-.88L10 2.5l2.97 5.03 6.09.88-4.88 3.77 1.7 5.91z" />
              </svg>
              <svg
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09L5.82 12.18.94 8.41l6.09-.88L10 2.5l2.97 5.03 6.09.88-4.88 3.77 1.7 5.91z" />
              </svg>
              <svg
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09L5.82 12.18.94 8.41l6.09-.88L10 2.5l2.97 5.03 6.09.88-4.88 3.77 1.7 5.91z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Columna central: descripción del plan */}
        <div className="flex-1">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-foreground mb-1">
              ZURICH - PLAN PRO
            </h3>
          </div>      
        </div>

        {/* Columna derecha: precios */}
       {/*  <div className="flex flex-col items-end gap-4 min-w-[180px]">
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">$116.78</div>
            <div className="text-xs text-muted-foreground mt-1">
              12 cuotas mensuales
            </div>
            <div className="text-xs text-muted-foreground">
              Pago con tarjeta de crédito
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">$1,401.36</div>
            <div className="text-xs text-muted-foreground">Incluye impuestos</div>
          </div>
        </div> */}

      </div>
    </div>
  );
}
