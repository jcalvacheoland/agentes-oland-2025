"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { CotizacionIcon } from "@/components/icons/Cotizacion";
import { PendienteIcon } from "@/components/icons/Pendiente";
import { AprobadoIcon } from "@/components/icons/Aprobado";
import { ValorAprobadoIcon } from "@/components/icons/ValorAprobado";
import { useDeals } from "@/hooks/useDeals";
import { useEffect, useMemo, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const TablaDeCotizaciones = ({ userId }: { userId: any }) => {
  const { items, err, loading } = useDeals(userId);

  // Paginación: 10 elementos por página, ID visual inicia en 1
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / pageSize)),
    [items.length]
  );
  const startIndex = (page - 1) * pageSize;
  const pageItems = useMemo(
    () => items.slice(startIndex, startIndex + pageSize),
    [items, startIndex]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const contarCotizaciones = () => items.length;
  const contarPendientes = () =>
    items.filter((item) => item.STAGE_ID === "C24:NEW").length;
  const contarAprobadas = () =>
    items.filter((item) => item.STAGE_ID === "C24:UC_ZCRTSB").length;
  const contarConComision = () =>
    items.filter((item) => item.STAGE_ID === "C24:UC_XMLGTG").length;

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-1  sm:grid-cols-none">
        {/* Texto en dispositivos moviles */}
        <div className="mb-6">
          <h1 className=" text-3xl font-bold">Tus cotizaciones</h1>
        </div>

        <div className=" flex justify-end">
          <Link href="/dashboard/cotizaciones">
            <Button className="bg-rojo-oland-100 hover:bg-azul-oland-100 ">
              Crear nueva cotización
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total cotizaciones
            </CardTitle>
            <CotizacionIcon width={24} height={24} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contarCotizaciones()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <PendienteIcon width={24} height={24} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contarPendientes()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <AprobadoIcon width={24} height={24} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contarAprobadas()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cotización con comisión
            </CardTitle>
            <ValorAprobadoIcon width={24} height={24} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contarConComision()}</div>
          </CardContent>
        </Card>
      </div>

      {err && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {err}
        </div>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Valor cotizado</TableHead>
              <TableHead>Etapa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((item, idx) => (
              <TableRow key={item.ID}>
                <TableCell className="font-medium">
                  {items.length - (startIndex + idx)}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={item.TITLE}>
                    {item.TITLE}
                  </div>
                </TableCell>
                <TableCell>
                  {item.OPPORTUNITY ? (
                    <Badge variant="secondary">{item.OPPORTUNITY}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {item.STAGE_ID ? (
                    <Badge variant="outline">{item.STAGE_ID}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between p-4">
          <div className="hidden md:block md:text-sm md:text-muted-foreground">
            Página {page} de {totalPages} · Mostrando {pageItems.length} de{" "}
            {items.length}
          </div>
          <div className="flex gap-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    className={
                      page <= 1 ? "pointer-events-none opacity-50" : undefined
                    }
                  />
                </PaginationItem>
                {(() => {
                  const nodes: React.JSX.Element[] = [];
                  const pushPage = (n: number) => {
                    nodes.push(
                      <PaginationItem key={n}>
                        <PaginationLink
                          href="#"
                          isActive={n === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(n);
                          }}
                        >
                          {n}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  };
                  if (totalPages <= 7) {
                    for (let n = 1; n <= totalPages; n++) pushPage(n);
                  } else {
                    pushPage(1);
                    const left = Math.max(2, page - 1);
                    const right = Math.min(totalPages - 1, page + 1);
                    if (left > 2) {
                      nodes.push(
                        <PaginationItem key="ellipsis-left">
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    for (let n = left; n <= right; n++) pushPage(n);
                    if (right < totalPages - 1) {
                      nodes.push(
                        <PaginationItem key="ellipsis-right">
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    pushPage(totalPages);
                  }
                  return nodes;
                })()}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                    className={
                      page >= totalPages
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </Card>
    </div>
  );
};
