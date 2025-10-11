import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
   <div className="text-center mt-20">
    <h1>Pagina principal</h1>
    <h2 className="mt-12">Click en el siguiente boton para ir a la pagina de Inicio de sesion</h2>
    <Button >
      <Link href="/login">
      </Link>
    </Button>

   </div>
  );
}
