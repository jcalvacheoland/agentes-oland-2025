import { LoginCard } from "./components/LoginCard";
import { auth } from "@/auth" // si usas la configuración de Auth.js 5+
import { redirect } from "next/navigation"

export default async function LoginPage() {

  const session = await auth() // 🔹 obtiene la sesión actual

  if (session) {
    // 🔹 Si el usuario ya está autenticado
    redirect("/dashboard")
  }

  return(
    <div>
      <LoginCard />;
    </div>
  ) 
}
