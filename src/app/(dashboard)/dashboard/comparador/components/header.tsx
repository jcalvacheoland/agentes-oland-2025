type HeaderProps = {
  name: string
  vehicle: string
  model: string
  year: number
  valorAsegurado: number
}

export const HeaderCotizador = (props: HeaderProps) => {
  return (
    <header className="w-full bg-gradient-to-b from-background to-muted/20 border-b">
      <div className="max-w-8xl mx-auto px-4 py-8 ">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-2xl font-bold text-foreground mb-2">Bienvenido, {props.name}</h1>
          <p className="text-muted-foreground text-lg">Estos son los planes disponibles para tu vehículo</p>
        </div>

        {/* Vehicle Information Card */}
        <div className="bg-card border rounded-lg shadow-sm p-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Vehicle Details */}
            <div className="space-y-3 grid grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Vehículo</p>
                <p className="text-lg font-semibold text-foreground">{props.vehicle}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Modelo</p>
                <p className="text-lg font-semibold text-foreground">{props.model}</p>
              </div>
            </div>

            {/* Year and Value */}
            <div className="space-y-3 grid grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Año</p>
                <p className="text-lg font-semibold text-foreground">{props.year}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Valor Asegurado</p>
                <p className="text-xl font-bold text-primary">
                  $
                  {props.valorAsegurado.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
