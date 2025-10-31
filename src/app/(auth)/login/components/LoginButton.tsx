"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
export const LoginButton = () => {
  return (
    <Button
      type="button"
      variant="oland"
      onClick={() => signIn("bitrix", { redirectTo: "/inicio" })}
      className="w-full h-14 text-base font-semibold hover:bg-rojo-oland-100 bg-azul-oland-100 text-white transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-[1.02] rounded-full"
      size="lg"
    >
      Iniciar sesión
    </Button>
  );
};
