"use client"

import { Button } from "@/components/ui/button";

export const Header=()=>{
      
  return (
    <header className=" absolute w-full  z-50 y-4">
      <div className="container mx-auto px-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="text-white text-2xl font-bold content-center grid">
           <img 
                src="/img/logos/logo_grupo_oland_blanco.svg" 
                alt="Logo Grupo Oland" 
                className="h-auto w-50 md:h-16 md:w-auto"
                />
          </div>
        </div>
      </div>
    </header>
  );
};