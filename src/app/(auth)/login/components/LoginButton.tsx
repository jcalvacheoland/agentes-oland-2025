"use client"
import { signIn } from "next-auth/react"

export const  LoginButton=()=> { 
  return (
    <button
  type="button"
  onClick={() => signIn("bitrix", { redirectTo: "/dashboard" })}
  className="px-4 py-2 bg-azul-oland-100 hover:bg-rojo-oland-100 text-white text-center rounded-lg"
>
  Iniciar sesión con Bitrix24
</button>

  )
}