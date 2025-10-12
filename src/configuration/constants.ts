export const BITRIX_CLIENT_ID = process.env.BITRIX_CLIENT_ID;
export const BITRIX_CLIENT_SECRET = process.env.BITRIX_CLIENT_SECRET;
export const BITRIX_AUTH_URL = process.env.BITRIX_AUTH_URL;
export const BITRIX_TOKEN_URL = process.env.BITRIX_TOKEN_URL;
export const BITRIX_API_URL = process.env.BITRIX_API_URL;
export const BITRIX_REDIRECT_URI = process.env.BITRIX_REDIRECT_URI;
export const BITRIX_HOOK_URL = process.env.BITRIX_HOOK_URL;
export const BITRIX_USER_ID = process.env.BITRIX_USER_ID;
export const BITRIX_SECRET = process.env.BITRIX_SECRET;
export const BITRIX_API_ADD_DEAL = process.env.api_add_dead; 
//API Catalog
export const HOST_CATALOG = process.env.HOST_CATALOG_DEV_PROD;
export const CLIENT_SECRET=process.env.PRODUCTION_CLIENT_SECRET;
export const HOST_TOKEN=process.env.HOST_TOKEN;
//Número de cotizaciones permitidas por usuario en un día
export const VALIDAR_NUMERO_COTIZACIONES=3;
//Locastorage
export const KEY_ENCRIPTACION_LOCALSTORAGE =process.env.KEY_ENCRIPTACION_LOCALSTORAGE;
export const KEY_ENCRIPTACION_TOKEN = process.env.KEY_ENCRIPTACION_TOKEN;

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
  { name: "Chubb", img: "/img/logoAseguradora/chubb.jpg" },
  { name: "Mapfre", img: "/img/logoAseguradora/mapfre.png" },
  { name: "Generali", img: "/img/logoAseguradora/Generali.webp" },
  { name: "AIG", img: "/img/logoAseguradora/aig.jpeg" },
  { name: "Vaz Seguros", img: "/img/logoAseguradora/vaz.jpg" },
  { name: "asur", img: "/img/logoAseguradora/asur.webp" },
]