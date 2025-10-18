"use client"
import { LoginButton } from "./LoginButton"

export const LoginCard = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-start md:p-8 p-4 relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/img/login-bg.png)",
        }}
      >
        {/* Subtle overlay for better contrast */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="w-full max-w-md space-y-6 relative text-center z-10 backdrop-blur-xl bg-white/20 p-10 rounded-2xl shadow-2xl border border-white/30">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-black tracking-tight">Bienvenido al portal de agentes</h1>
       
        </div>

        <div className="pt-4">
          <LoginButton />
        </div>
      </div>
    </div>
  )
}
