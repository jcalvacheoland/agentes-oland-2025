import { auth } from "@/auth" // si usas la configuración de Auth.js 5+
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { LoginButton } from "./components/LoginButton";
export default async function LoginPage() {

  const session = await auth() // 🔹 obtiene la sesión actual

  if (session) {
    // 🔹 Si el usuario ya está autenticado
    redirect("/dashboard")
  }

  return(
     <div className="min-h-screen grid lg:grid-cols-2 font-outfit">
      {/* Left side with illustration */}
      <div className="relative hidden lg:flex flex-col items-center justify-center p-8 bg-azul-oland-100 text-white">
        <div className="max-w-md mx-auto text-center space-y-6">
        
          <h2 className="text-3xl font-medium ">Tu portal de cotizaciones</h2>
          <p className="text-sm text-white/80">
            Accede a las mejores ofertas y gestiona tus cotizaciones de manera rápida y sencilla con nuestra plataforma dedicada a agentes de seguros.
          </p>
          
        </div>
      </div>

      {/* Right side with login form */}
      <div className="flex flex-col items-center justify-center p-8">
         <img 
         src="/img/agentesLogo.jpg" 
         width={200}
         height={180}
         alt="" />
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            
            <h1 className="text-2xl font-script mb-6"></h1>
            <h2 className="text-xl text-gray-600">Bienvenido </h2>
          </div>

          <form className="space-y-6">
            

            <div className="space-y-2">
              
            </div>

            <LoginButton></LoginButton>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              
            </div>

            

           
          </form>
        </div>
      </div>
    </div>
  ) 
}
