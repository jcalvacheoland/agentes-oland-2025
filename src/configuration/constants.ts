export const CATEGORY_ID = 24
export const STAGE_ID = "C24:NEW"
export const BITRIX_USER_AGENT = "oland-agentes/1.0"
export const BITRIX_WEBHOOK=process.env.BITRIX_WEBHOOK;
//s123
export const HOST_CATALOG = process.env.HOST_CATALOG;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const HOST_TOKEN= process.env.HOST_TOKEN;
export const Aseguradoras = ["zurich", "chubb",  "asur","sweaden", ]; 

export const ECUADOR_CITIES = [
  "QUITO",
  "CUENCA",
  "GUARANDA",
  "AZOGUES",
  "TULCAN",
  "RIOBAMBA",
  "LATACUNGA",
  "MACHALA",
  "ESMERALDAS",
  "PUERTO BAQUERIZO MORENO",
  "GUAYAQUIL",
  "IBARRA",
  "LOJA",
  "BABAHOYO",
  "PORTOVIEJO",
  "MACAS",
  "TENA",
  "PUERTO FRANCISCO DE ORELLANA",
  "PUYO",
  "SANTA ELENA",
  "SANTO DOMINGO",
  "NUEVA LOJA",
  "AMBATO",
  "ZAMORA",
] as const;

export const AseguradorasLogo = [
  { name: "Zurich", img: "/img/logoAseguradora/zurich.png" },
  {name: "sweaden", img: "/img/logoAseguradora/sweaden.png" },
  { name: "Chubb", img: "/img/logoAseguradora/chubb.png" },
  { name: "Mapfre", img: "/img/logoAseguradora/mapfrev2.png" },
  { name: "Generali", img: "/img/logoAseguradora/Generali.png" },
  { name: "AIG", img: "/img/logoAseguradora/aig.png" },
  { name: "Vaz Seguros", img: "/img/logoAseguradora/vaz.png" },
  { name: "asur", img: "/img/logoAseguradora/asur.png" },
  { name: "ASEGURADORA DEL SUR", img: "/img/logoAseguradora/asur.png" },
]

// utils/coberturasOrdenadas.ts
export const COBERTURAS_ORDENADAS = [
  "Responsabilidad Civil",
  "Muerte Accidental",
  "Gastos Médicos",
  "Amparo Patrimonial",
  "Pérdida parcial por daño o robo",
  "Pérdida total por daño",
  "Pérdida total por robo (sin dispositivo de rastreo)",
  "Pérdida total por robo (con dispositivo de rastreo)",
  "Pacto Andino",
  "Airbag",
  "Servicio de grúa",
  "Asistencia vehicular",
  "Asistencia legal",
  "Asistencia exequial",
  "Auto sustituto",
];
