export const calcularEdad = (fechaNacimiento: string): string => {
  if (!fechaNacimiento) return "";
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad.toString();
};

export const calcularFechaDesdeEdad = (edadStr: string): string => {
  const edad = parseInt(edadStr, 10);
  if (Number.isNaN(edad) || edad <= 0) return "2000-01-01";
  const hoy = new Date();
  const birthYear = hoy.getFullYear() - edad;
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  return `${birthYear}-${month}-${day}`;
};

export const normalizarTexto = (value?: string | null): string => {
  if (value === undefined || value === null) return "";
  return String(value).replace(/\s+/g, " ").trim();
};

// Formatea placa a formato AAA-### o AAA-#### en mayúsculas
export const formatearPlaca = (value?: string | null): string => {
  if (!value) return "";
  const raw = String(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!raw) return "";

  // Obtener primeras 3 letras
  const soloLetras = raw.replace(/[^A-Z]/g, "");
  const letras = soloLetras.slice(0, 3);

  // Obtener hasta 4 dígitos después de las letras detectadas
  // Si el usuario escribió letras y números mezclados, priorizamos 3 letras seguidas + dígitos
  const resto = raw.replace(/^[A-Z]{0,3}/, "");
  const digitos = resto.replace(/[^0-9]/g, "").slice(0, 4);

  if (!letras) {
    // Si no hay letras suficientes, devolvemos solo los dígitos (caso incompleto de entrada)
    return digitos;
  }
  if (!digitos) {
    return letras;
  }
  return `${letras}-${digitos}`;
};
