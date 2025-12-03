"use server";
import {
  guardarTokenAutorizacion,
  leerTokenAutorizacion,
  validateCedula,
} from "@/configuration/utils";

import { postData, request } from "@/configuration/conexion";
import {
  IPersona,
  IPlanRequest,
  IPlanResponse,
  IResponseAPI,
  ITokenAutorizacion,
  IVehiculoAPI,
} from "@/interfaces/interfaces.type";

import { HOST_CATALOG,HOST_TOKEN,CLIENT_SECRET } from "@/configuration/constants";
import { OCP_APIM_KEY } from "@/configuration/constants";

const shouldLogPlanRequests =(process.env.DEBUG_PLAN_REQUESTS ?? "false").toLowerCase() === "true";

const logPlanRequest = (
  aseguradora: string,
  planRequest: IPlanRequest,
  response: any
) => {
  if (!shouldLogPlanRequests) return;
  const prefix = `[${aseguradora.toUpperCase()}]`;
  console.log(
    `${prefix} identification: ${planRequest.identification} | plate: ${planRequest.plate}`
  );
  console.log(`${prefix} request body:`, planRequest);
  console.log(`${prefix} raw response:`, response);
};


// contiene la logica para leer y mantener el token de autenticacion
export const devolverToken = async (client_id?: number): Promise<string | null> => {
    let token = leerTokenAutorizacion();
    if (token) {
        //TODO: validar si es valido
        return token.access_token;
    }
    let solicita = await obtenerToken(client_id ? client_id : 1);
    if (solicita) {
        guardarTokenAutorizacion(solicita);
        return solicita.access_token;
    }
    return null;
};


export const obtenerToken = async (
  client_id: number
): Promise<ITokenAutorizacion | null> => {
  const response: any = await postData(`${HOST_TOKEN}`, {
    grant_type: "client_credentials",
    client_id: client_id,
    client_secret: CLIENT_SECRET,
  });
  if (response && response.access_token && response.expires_in) {
    return response;
  }
  return null;
};

export const obtenerPersonaPorCedula = async (
  cedula: string
): Promise<IPersona | null> => {
  if (!validateCedula(cedula)) {
    return null;
  }

  // 1️⃣ VERIFICAR LISTA NEGRA
  const blacklistPayload = {
    sUSERCODE: "USRDIRECTOS",
    sDocId: cedula,
    sNom1: "",
    sNom2: "",
    sApe1: "",
    sApe2: "",
    bEnviarEmailCumplimiento: false,
    sTipoTransaccion: "COTIZACION",
    sBroker: "NOMBRE CORREDOR",
    sEjComercial: "NOMBRE CORREDOR",
  };

  const blacklistHeaders = {
    "Content-Type": "application/json",
    Accept: "*/*",
    "Ocp-Apim-Subscription-Key": OCP_APIM_KEY,
  };

  const blacklistResponse = await postData(
    "https://apimgr.equinoccialonline.com/cotizacion/staging/api/v1.1/gestioncliente/mantenimiento/gci/cliente-lista-negra-avanzado",
    blacklistPayload,
    blacklistHeaders
  );

  /* onsole.log("Respuesta lista negra:", blacklistResponse); */

  /**
   * ❌ Si respuesta === true → ESTÁ EN LISTA NEGRA → BLOQUEAR
   * ✔ Si respuesta === false → SE PERMITE CONTINUAR
   */
  if (!blacklistResponse || blacklistResponse.error !== 0) {
    /* console.log("Error consultando lista negra:", blacklistResponse); */
    return null;
  }

  if (blacklistResponse.respuesta === true) {
    /* console.log("🚫 Cedula BLOQUEADA en lista negra:", cedula); */
    return null;
  }

  /* console.log("✅ Cedula limpia (NO está en lista negra):", cedula); */

  // 2️⃣ OBTENER TOKEN DEL CATALOGO
  const token = await devolverToken();

  // 3️⃣ CONSULTAR PERSONA NORMAL
  const response: IResponseAPI = await postData(
    `${HOST_CATALOG}/comparator/api/catalogs/person`,
    {
      identification: cedula,
    },
    {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  );

  if (response && response.status === 200) {
   /*  console.log("CEDULA:", cedula);
    console.log("RESPONSE API:", response);
    console.log("STATUS:", response.status); */

    return response.data;
  }

  return null;
};




export const obtenerVehiculoPorPlaca = async (
  placa: string
): Promise<IVehiculoAPI | null> => {
  const token = await devolverToken();
  if (!token) {
    return null;
  }

  const response: IResponseAPI = await postData(
    `${HOST_CATALOG}/comparator/api/catalogs/vehicle-plate`,
    {
      plate: placa,
    },
    {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  );

  if (response && response.status === 200) {
    return response.data;
  }

  return null;
};


export const obtenerPlanPorAseguradora2 = async (aseguradora: string, planRequest: IPlanRequest): Promise<IPlanResponse> => {

    let token = await devolverToken();

    const response: any = await request(`${HOST_CATALOG}/comparator/api/vehicle/${aseguradora}`,
        planRequest,
        {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        }
    )
    logPlanRequest(aseguradora, planRequest, response);
    
    if (response && response.status === 200) {
        return response.data;
    } else {
        return response.error;
    }
};

export const obtenerPlan = async (aseguradora: string, planRequest: IPlanRequest): Promise<IPlanResponse> => {

    let token = await devolverToken();

    const response: any = await request(`${HOST_CATALOG}/comparator/api/vehicle/${aseguradora}`,
        planRequest,
        {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        }
    )
    
    if (response && response.status === 200) {
        return response.data;
    } else {
        return response.error;
    }
};

export const createDealInBitrix = async (fields: any, accessToken: string, domain: string)=> {
  const url = `https://${domain}/rest/crm.deal.add.json?auth=${accessToken}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  return res.json();
}
