"use server"
//actualmente no se usa
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
export interface RegisterUserResult {
  success: boolean
  message: string
  userId?: number
}

export async function registerUser(email: string): Promise<RegisterUserResult> {
  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: "Por favor, ingresa un email válido.",
    }
  }

  const department = 1
  const apiUrl = `https://oland.bitrix24.com/rest/7004/ixla2zjdc971jkch/user.add.json?EMAIL=${encodeURIComponent(email)}&UF_DEPARTMENT=${encodeURIComponent(department)}`

  try {
    const response = await fetch(apiUrl)
    const data = await response.json()

    if (data.result) {
      return {
        success: true,
        message: `Usuario registrado correctamente. ID: ${data.result}`,
        userId: data.result,
      }
    } else if (data.error_description) {
      return {
        success: false,
        message: `Error: ${data.error_description}`,
      }
    } else {
      return {
        success: false,
        message: "Ocurrió un error inesperado.",
      }
    }
  } catch (error) {
    console.error("Error al llamar la API:", error)
    return {
      success: false,
      message: "Error de conexión con la API.",
    }
  }
}
