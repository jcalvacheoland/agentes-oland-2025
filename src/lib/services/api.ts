/* import { CLIENT_SECRET } from "../../configuration/constants";
import { HOST_TOKEN } from "@/configuration/constants";
import { HOST_CATALOG } from "../../configuration/constants";
 */
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

const HOST_CATALOG = "https://s123-cat-pro.azurewebsites.net";
const CLIENT_SECRET = "NMYsnrcJsM7S9dPypVcq5ONnYbPzVoZltlVYXpcT";
const HOST_TOKEN="https://s123-cat-pro.azurewebsites.net/oauth/token";



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

  const token = await devolverToken();

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
// Debe mostrar la URL base
  if (response && response.status === 200) {
    console.log(cedula)
    console.log(response)
    console.log(response.status)
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
    console.log(response.status)
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
