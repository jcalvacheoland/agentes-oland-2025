export interface ITokenAutorizacion {
    token_type: string;
    expires_in: number;
    access_token: string;
    expire_date?: number;
};

export interface IResponseAPI  {
    status: number;
    results: number;
    data: any;
};

export interface IVehiculoAPI  {
    brand: string;
    model: string;
    year: number;
    value: number;
    type: string;
    codeBrand: number;
    codeModel: number;
    codeType: number;
    codeSubmodel: string;
    ramv: string;
    submodelEqui?: string;
    subtype?: string;
    equiCodeSubmodel?: string;
    chubb_mm?: string;
    asur_brand?: string;
    asur_model?: string;
};

export interface IPlanRequest {
    plate: string;
    submodelEqui: number ;
    brand: string;
    model: string;
    year: number;
    vehicleValue: number;
    type: string;
    subtype: string;
    extras: number;
    newVehicle: number;
    city: string;
    region?: string;
    province?: string;
    identification: string;
    name: string;
    firstLastName: string;
    secondLastName: string;
    gender: string;
    civilStatus: string;
    birthdate: string;
    age: number;
    cityCodeMapfre: number;
    chubb_mm?: string;
    asur_brand?: string;
    asur_model?: string;
    useOfVehicle?: string;
};

export interface IVehiculoRequest  {
    lead?: string;
    clientId: string;
    step: string;
    type: string;
    subtype: string;
    new: number;
    plate: string;
    brand: string;
    model: string;
    version: string;
    year: number;
    commercialValue: string;
    city: string;
    province: string;
    use: string;
    bitrixDeal?: number;
    adviser?: string;
    typePolicy?: string;
    tradeGroups?: string;
    chubb_mm?: string;
    asur_brand?: string;
    asur_model?: string;
};


export interface IPersona  {
    name: string;
    names: string;
    firstLastName: string;
    secondLastName: string;
    civilStatus: string;
    gender: string;
    birthDate: string;
    age: number;
};

export interface IPlanResponse  {
    chargeCard: number;
    description: string;
    emissionValue: number;
    id: number;
    ivaTax: number;
    name: string;
    netPremium: number;
    peasantTax: number;
    period: number;
    principals: {
        DEDUCIBLE: string;
        ["PRINCIPALES COBERTURAS"]: string;
        BENEFICIOS_ESPECIALES: string;
    };
    ranking: number;
    rate: number;
    restrictions: [];
    secondaries: [];
    status: number;
    subtotalPremium: number;
    subtotalPremium2: number;
    superintendencyBanksTax: number;
    totalPremium: number;
    netPremiumValidity: number;
    totalPremiumValidity: number;
    rateValidity: number;
    vatValidity: number;
    taxValidity: number;
};

export type ICliente = {
  cedula: string;
  nombres: string;
  apellidos?: string;
  primerApellido?: string;
  segundoApellido?: string;
  fechaNacimiento?: string;
  edad?: string;
  genero?: string;
  email: string;
  celular: string;
  ciudad?: string;
  provincia?: string;
  region?: string;
  codMapfre?: number;
};



export type IPlan = {
  aseguradora?: string;
  nombre?: string;
  period?: number;
  totalPremium?: number;
  netPremium?: number;
  ivaTax?: number;
  peasantTax?: number;
  rate?: number;
  logo?: string;
};

export type ICiudadAPI = {
  city: string;
  province: string;
  region: string;
  codMapfre: number;
};


