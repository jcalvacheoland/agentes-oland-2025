"use client"

import { Button } from "@/components/ui/button";

export const Header=()=>{
      
  return (
    <header className=" absolute w-full  z-50 y-4">
      <div className="container ">
        <div className="flex ">    
            <div className="object-cover  ">
            <img src="/img/logos/logoGrupoOlandHDWhite.png"
            className="hidden sm:block" 
            width={200}
            height={200}
            alt="Grupo Oland - Agentes Oland" />
          </div>
       
        </div>
      </div>
    </header>
  );
};