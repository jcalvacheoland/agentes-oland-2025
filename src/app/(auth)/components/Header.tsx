"use client"

import { Button } from "@/components/ui/button";

export const Header=()=>{
      
  return (
    <header className="bg-gradient-to-b absolute w-full  z-50 from-azul-oland-100 to-transparent py-4">
      <div className="container mx-auto px-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="text-white text-2xl font-bold content-center grid">
           <img 
                src="/img/logos/logo_grupo_oland_blanco.svg" 
                alt="Logo Grupo Oland" 
                className="h-auto w-50 md:h-16 md:w-auto"
                />
          </div>
          <Button variant={"oland"} size={"lg"}>
            Inicio
          </Button>
        </div>
      </div>
    </header>
  );
};