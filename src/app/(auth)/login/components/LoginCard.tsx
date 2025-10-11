"use client"
import  {LoginButton} from "./LoginButton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";


export const LoginCard = () => {
    return (
    <Card className="mx-auto w-auto lg:w-[350] lg:h-[300]   space-y-4 max-w-md boreder-lg  shadow-lg">

        <CardHeader className="space-y-4">
            <CardTitle className="text-3xl font-bold text-center">Inicia Sesion</CardTitle>
            <CardDescription className="text-center text-lg">Inicia Sesion con tus Credenciales de Bitrix24</CardDescription>
        </CardHeader>
        <form 
        
        className="space-y-4" >
            <CardContent className="space-y-4">
                <div className="flex flex-col space-y-4">
                <LoginButton />
                </div> 
            </CardContent>

            {/* <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-center text-muted-foreground">
                    ¿No tienes una cuenta?{" "}
                    
                        <Button variant="link" className="p-0 h-auto font-normal">
                        <Link href="/register">    Crea tu cuenta</Link>
                        </Button>
                    
                </div>
            </CardFooter> */}
        </form>
    </Card>
    );
}