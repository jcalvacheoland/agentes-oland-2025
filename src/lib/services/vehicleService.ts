const VEHICULO_API_URL = "/api/sri"; // GET /api/vehiculos?placa=ABC1234

export async function getByPlaca(
  placa: string): Promise<{ 
  marca?: string; 
  modelo?: string; 
  anio?: string 
}> {
  const url = `${VEHICULO_API_URL}?placa=${encodeURIComponent(placa)}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    const err: any = new Error("Error buscando vehículo");
    err.status = res.status;
    try {
      err.body = await res.json();
    } catch {
      err.body = null;
    }
    throw err;
  }
  return res.json();
}
