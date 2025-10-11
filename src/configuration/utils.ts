import { ITokenAutorizacion } from "@/interfaces/interfaces.type";
// NOTE: se eliminó la importación de CryptoJS y las constantes de clave de encriptación

export const validateCedula = (cad: any) => {
    var total = 0;
    var longitud = cad.length;
    var longcheck = longitud - 1;

    if (cad !== "" && longitud === 10) {
        for (var i = 0; i < longcheck; i++) {
            if (i % 2 === 0) {
                var aux = cad.charAt(i) * 2;
                if (aux > 9) aux -= 9;
                total += aux;
            } else {
                total += parseInt(cad.charAt(i));
            }
        }
        total = total % 10 ? 10 - (total % 10) : 0;
        return cad.charAt(longitud - 1) == total ? true : false;
    }
};

export const ValidarRuc = function (ruc: number | string) {
    if (typeof ruc == "string" && ruc.length == 13 && /^\d+$/.test(ruc)) {
        var digitos = ruc.split("").map(Number);
        var codigo_provincia = digitos[0] * 10 + digitos[1];
        var display_noveno;
        var tipo_modulo;
        var coeficientes: any;

        if (
            (codigo_provincia >= 1 && codigo_provincia <= 24) ||
            codigo_provincia == 30
        ) {
            if (digitos[2] != 7 && digitos[2] != 8) {
                tipo_modulo = digitos[2] > 5 ? 11 : 10;
                if (digitos[2] == 6) {
                    // institución pública
                    digitos = digitos.slice(0, 9);
                    display_noveno = false;
                    coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
                } else {
                    // caso normal
                    digitos = digitos.slice(0, 10);
                    display_noveno = true;
                    coeficientes =
                        digitos[2] == 9
                            ? [4, 3, 2, 7, 6, 5, 4, 3, 2]
                            : [2, 1, 2, 1, 2, 1, 2, 1, 2];
                }
                var digito_verificador = digitos.pop();
                var digito_calculado =
                    tipo_modulo -
                    (digitos.reduce(function (
                        valorPrevio,
                        valorActual,
                        indice
                    ) {
                        var resultado = valorActual * coeficientes[indice];
                        if (digitos[2] < 6) {
                            // si es persona natural:
                            resultado =
                                resultado > 9 ? resultado - 9 : resultado;
                        }
                        return valorPrevio + resultado;
                    },
                    0) %
                        tipo_modulo);
                digito_calculado =
                    digito_calculado === 11 ? 0 : digito_calculado;
                if (digito_calculado === digito_verificador) {
                    return true;
                } else {
                    //No coincide el dígito verificador
                    return false;
                }
            } else {
                //El tercer dígito no debe ser 7 o 8
                return false;
            }
        } else {
            //Los dos primeros dígitos deben estar entre 01 y 24, o 30 para ecuatorianos registrados en el exterior
            return false;
        }
    } else {
        //No son 13 dígitos
        return false;
    }
};

export const validarEdad = (edad: string) => {
    if (edad === undefined || edad === null) {
        return false;
    }
    return edad !== null && edad !== "" && edad.length <= 2 && edad <= "90"
        ? true
        : false;
};

export const validarNoVacio = (val: string) => {
    if (val === undefined || val === null) {
        return false;
    }
    return val !== null && val !== "" && val.length >= 2 ? true : false;
};

export const validarEmailSeguros123 = (email: string): boolean => {
    return email === "cotizaciones@seguros123.com"
        ? true
        : email.indexOf("@seguros123.com") === -1
        ? true
        : false;
};

export const calcularEdad = (fecha: any) => {
    var hoy = new Date();
    var cumpleanos = new Date(fecha);
    var edad = hoy.getFullYear() - cumpleanos.getFullYear();
    var m = hoy.getMonth() - cumpleanos.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
    }
    return edad;
};

export const formatearNumero = (x: any) => {
    const options = {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    };
    return Number(x).toLocaleString("en", options);
};

export const calcularFechaNacimiento = (age: any): string => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - Number(age));
    return currentDateTime(date, "date", "-");
};

export const currentDateTime = (
    date = new Date(),
    type = "dateTime",
    separator = "/"
): string => {
    const year = date.getFullYear();
    const month =
        date.getMonth() + 1 < 10
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1;
    const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    const hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    const minute =
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    const second =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    if (type == "date") {
        return year + separator + month + separator + day;
    } else {
        return (
            year +
            separator +
            month +
            separator +
            day +
            " " +
            hour +
            ":" +
            minute +
            ":" +
            second
        );
    }
};

export const padString = (cadena: string, tamanio: number) => {
    var str = "" + cadena;
    while (str.length < tamanio) {
        str = "0" + str;
    }
    return str;
};

export const validarNombre = (nombre: string) => {
    let nombreLimpio = nombre.replace(/[^A-Za-z0-9_ '-]/gi, "");
    nombreLimpio = nombreLimpio.toUpperCase();
    return /^(([A-Za-z]+[\-\']?)*([A-Za-z]+)?\s)+([A-Za-z]+[\-\']?)*([A-Za-z]+)?$/.test(
        nombreLimpio
    );
};

const decodeTokenPayload = (raw: string | null): ITokenAutorizacion | null => {
    if (!raw) {
        return null;
    }

    const validate = (token: any) => {
        if (token && typeof token.expire_date === "number") {
            const now = new Date().getTime();
            if (now <= token.expire_date) {
                return token;
            }
        }
        return null;
    };

    const tryParse = (value: string) => {
        try {
            return validate(JSON.parse(value));
        } catch {
            return null;
        }
    };

    // 1) intentamos JSON.parse directo
    const parsed = tryParse(raw);
    if (parsed) {
        return parsed;
    }

    // 2) si no, intentamos tratar el valor como base64 (antes se usaba AES, ahora solo base64/JSON)
    try {
        return tryParse(window.atob(raw));
    } catch {
        return null;
    }
};

export const leerTokenAutorizacion = (): ITokenAutorizacion | null => {
    if (typeof window === "undefined") {
        return null;
    }

    const storedValue = localStorage.getItem("s123");
    const directToken = decodeTokenPayload(storedValue);
    if (directToken) {
        return directToken;
    }

    // Si no se pudo parsear, ya no intentamos descifrar (AES eliminado)
    return null;
};

export const leerTokenAutorizacionSeguro = (): { token: string; expire_date: number } | null => {
    if (typeof window === "undefined") {
        return null;
    }

    const storedValue = localStorage.getItem("s123");
    const tokenInfo = decodeTokenPayload(storedValue);
    if (tokenInfo && tokenInfo.access_token) {
        return { token: tokenInfo.access_token, expire_date: tokenInfo.expire_date || 0 };
    }

    // No hay más intentos de "desencriptado"
    return null;
};

export const guardarTokenAutorizacion = (token: ITokenAutorizacion) => {
    if (typeof window !== "undefined") {
        console.log("DEBUG: guardando token en localStorage", token);
        const hoy = new Date().getTime();
        const expira = hoy + (token.expires_in - 2) * 1000;
        token.expire_date = expira;
        const payload = JSON.stringify(token);
        // Guardamos el payload en texto (antes se encriptaba)
        localStorage.setItem("s123", payload);
    }
};

export const obtenerEmailsBLoqueados = () => {
    let emails = [
        "raultores.14@hotmail.es",
        "kary2didi@gmail.com",
        "juan87100@gmail.com",
        "bussbox.com",
        "nvivanco@brokersaec.com",
        "alexca27@live.com",
        "seguros123",
        "lgutierrez.qbe",
        "peggycartwright",
        "susasesores_seguros",
        "se.americanbrokers",
        "dsanchez@seguroskcer.com",
        "circuitositc98@gmail.com",
        "diegozarangoordonez@gmail.com",
        "ismavillacis05@gmail.com",
        "christiancaminov@gmail.com",
        "isaacgr7@gmail.com",
        "kary2didi@gmail.com",
        "tomasvejar90@gmail.com",
        "proyectostr2015@gmail.com",
        "benites@hotmail.com",
        "randres.casa7@gmail.com",
    ];
    return emails;
};

export const obtenerEmailsBLoqueadosCC = () => {
    let emails = [
        "lgutierrez.qbe",
        "peggycartwright",
        "susasesores_seguros",
        "se.americanbrokers",
        "dsanchez@seguroskcer.com",
        "circuitositc98@gmail.com",
        "diegozarangoordonez@gmail.com",
        "ismavillacis05@gmail.com",
        "christiancaminov@gmail.com",
        "isaacgr7@gmail.com",
        "kary2didi@gmail.com",
        "juan87100@gmail.com",
        "bussbox.com",
    ];
    return emails;
};

export const obtenerTelefonosBLoqueados = () => {
    let numeros = [
        "9999999",
        "8888888",
        "7777777",
        "6666666",
        "5555555",
        "4444444",
        "3333333",
        "2222222",
        "1111111",
        "0000000",
        "99999999",
        "88888888",
        "77777777",
        "66666666",
        "55555555",
        "44444444",
        "33333333",
        "22222222",
        "11111111",
        "00000000",
        "0983110900",
        "0996003303",
        "0912345678",
        "0988738004",
        "0982766859",
        "0989999999",
        "0987702513",
        "0981142553",
        "0998879983",
        "0989863125",
        "0968754111",
    ];

    return numeros;
};

export const codificarLocalStorage = (
    valorCodificar: any,
    nombreVariable: string,
    tipo?: string
) => {
    // Antes: window.btoa(JSON.stringify(...)) + AES
    // Ahora: almacenamos como base64 (para mantener compatibilidad con decodeTokenPayload que intenta atob)
    const objeto = window.btoa(JSON.stringify(valorCodificar));
    if (tipo && tipo === "session") {
        sessionStorage.setItem(nombreVariable, objeto);
    } else {
        localStorage.setItem(nombreVariable, objeto);
    }
};

export const decodificarLocalStorage = (
    nombreVariable: string,
    tipo?: string
) => {
    let tempo: string | null = null;
    if (tipo && tipo === "session") {
        tempo = sessionStorage.getItem(nombreVariable);
    } else {
        tempo = localStorage.getItem(nombreVariable);
    }

    if (!tempo) return null;

    // Intentamos parsear directamente (si se guardó JSON plano)
    try {
        return JSON.parse(tempo);
    } catch (err) {
        // Si falló, intentamos tratarlo como base64 (antes se usaba AES + base64)
        try {
            const desencriptado = window.atob(tempo);
            return JSON.parse(desencriptado);
        } catch (error) {
            return null;
        }
    }
};

export const validarExpiracionLocalStorage = () => {
    return new Promise((resolve) => {
        let expire_token: number = parseInt(
            localStorage.getItem("validation-token") ?? ""
        );
        if (expire_token && !isNaN(expire_token) && expire_token > 0) {
            let hoy: number = new Date().getTime();
            if (hoy > expire_token * 2 + 86400000) {
                //24 horas
                localStorage.clear();
                crearTokenValidez().then(() => {
                    resolve(true);
                });
            } else {
                resolve(true);
            }
        } else {
            localStorage.clear();
            crearTokenValidez().then(() => {
                resolve(true);
            });
        }
    });
};

export const crearTokenValidez = () => {
    localStorage.removeItem("validation-token");
    return new Promise((resolve) => {
        let hoy = new Date().getTime();
        hoy = hoy / 2;
        localStorage.setItem("validation-token", hoy.toString());
        resolve(true);
    });
};

import sha256 from "crypto-js/sha256";

export const hashSha256 = (cadena: string) => {
    return new Promise((resolve) => {
        let codifiado = sha256(cadena);
        resolve(codifiado.toString());
    });
};

export const armarBodyApiConversionesCotizacion = async (
    url: string,
    email: string,
    telefono: string,
    nombre: string,
    apellido: string,
    genero: string,
    ciudad: string,
    fechaNacimiento: string,
    marca: string,
    modelo: string,
    anio: number
) => {
    let partesFecha = fechaNacimiento.split("-");
    let fechaFinal = partesFecha[0] + partesFecha[1] + partesFecha[2];
    let generoFinal = genero.substring(0, 1).toLocaleUpperCase();
    let timestamp = Math.floor(new Date().getTime() / 1000);
    let hashEmail = await hashSha256(email.trim().toLowerCase());
    let hashTelefono = await hashSha256("+593" + telefono.substring(1));
    let hashNombre = await hashSha256(encodeURI(nombre.trim().toLowerCase()));
    let hashGenero = await hashSha256(generoFinal);
    let hashCiudad = await hashSha256(encodeURI(ciudad.trim().toLowerCase()));
    let hashFechaNacimiento = await hashSha256(fechaFinal);
    let hashApellido = await hashSha256(
        encodeURI(apellido.trim().toLowerCase())
    );
    let hashPais = await hashSha256("ec");
    let data: any = {
        data: [
            {
                event_name: "cotizar",
                event_time: timestamp,
                action_source: "website",
                event_source_url: url,
                user_data: {
                    em: hashEmail,
                    ph: hashTelefono,
                    fn: [hashNombre],
                    ge: [hashGenero],
                    ct: [hashCiudad],
                    db: [hashFechaNacimiento],
                    ln: [hashApellido],
                    country: [hashPais],
                },
                custom_data: {
                    marca: marca,
                    modelo: modelo,
                    anio: anio,
                },
            },
        ],
    };
    return data;
};

export const armarBodyApiConversionesElegir = async (
    url: string,
    email: string,
    telefono: string,
    nombre: string,
    apellido: string,
    genero: string,
    ciudad: string,
    fechaNacimiento: string,
    marca: string,
    modelo: string,
    anio: number,
    plan: string
) => {
    let partesFecha = fechaNacimiento.split("-");
    let fechaFinal = partesFecha[0] + partesFecha[1] + partesFecha[2];
    let generoFinal = genero.substring(0, 1).toLocaleUpperCase();
    let timestamp = Math.floor(new Date().getTime() / 1000);
    let hashEmail = await hashSha256(email.trim().toLowerCase());
    let hashTelefono = await hashSha256("+593" + telefono.substring(1));
    let hashNombre = await hashSha256(encodeURI(nombre.trim().toLowerCase()));
    let hashGenero = await hashSha256(generoFinal);
    let hashCiudad = await hashSha256(encodeURI(ciudad.trim().toLowerCase()));
    let hashFechaNacimiento = await hashSha256(fechaFinal);
    let hashApellido = await hashSha256(
        encodeURI(apellido.trim().toLowerCase())
    );
    let hashPais = await hashSha256("ec");
    let data: any = {
        data: [
            {
                event_name: "elegir",
                event_time: timestamp,
                action_source: "website",
                event_source_url: url,
                user_data: {
                    em: hashEmail,
                    ph: hashTelefono,
                    fn: [hashNombre],
                    ge: [hashGenero],
                    ct: [hashCiudad],
                    db: [hashFechaNacimiento],
                    ln: [hashApellido],
                    country: [hashPais],
                },
                custom_data: {
                    marca: marca,
                    modelo: modelo,
                    anio: anio,
                    plan: plan,
                },
            },
        ],
    };
    return data;
};
