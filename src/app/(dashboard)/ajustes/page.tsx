import { getAuthenticatedUser } from "@/actions/getUserBD";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = {
  title: "Ajustes",
};

export default async function AjustesPage() {
  const res = await getAuthenticatedUser();
  const user = (res as any)?.user;

  return (
    <div className="space-y-6">
      <header className="mt-6 ">
        <h1 className="text-2xl font-bold text-center">Ajustes</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Tu cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          {res?.success && user ? (
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ejecutivo Asignado</TableHead>
                    <TableHead>Logo PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.name ?? "-"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.ejecutivo
                        ? new Date(user.ejecutivo).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {user.imagenPDF
                        ? new Date(user.imagenPDF).toLocaleString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {res?.error ?? "No autenticado"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
