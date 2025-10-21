"use client";
import React, { useEffect, useMemo, useState } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const stageLabels: Record<string, string> = {
  "C24:NEW": "Nuevo",
  "C24:PREPARATION": "Preparación",
  "C24:UC_ZCRTSB": "Inspección",
  "C24:PREPAYMENT_INVOIC": "Inspección favorable",
  "C24:UC_87UXF3": "Formulario de vinculación",
  "C24:EXECUTING": "Orden de emisión",
  "C24:UC_CJKKJS": "Emitida",
  "C24:UC_GFUHD0": "Despacho de emisión",
  "C24:UC_9TDBGH": "Cobranza",
  "C24:UC_D2MRZM": "Pagado",
  "C24:UC_XMLGTG": "Comisión",
  "C24:WON": "Cerrada",
};

const formatUsdValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return null;
  }

  const [rawAmount] = String(value).split("|");
  const numericAmount = Number(rawAmount);

  if (Number.isFinite(numericAmount)) {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);

    return `$${formatted}`;
  }

  return rawAmount ? `$${rawAmount}` : null;
};

export const TablaDeCotizaciones = ({ userId }: { userId?: any }) => {
  const { items, err, loading } = useDeals(userId);

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
  }, [page, totalPages]);

  const contarCotizaciones = () => items.length;
  const contarPendientes = () =>
    items.filter((item) => item.STAGE_ID === "C24:NEW").length;

  const contarConComision = () =>
    items.filter((item) => item.STAGE_ID === "C24:UC_XMLGTG").length;

  const contarInspeccion = () =>
    items.filter((item) => item.STAGE_ID === "C24:UC_ZCRTSB").length;

  const contarEmision = () =>
    items.filter((item) => item.STAGE_ID === "C24:EXECUTING").length;


  const contarComisionPagada = () =>
    items.filter((item) => item.STAGE_ID === "C24:UC_D2MRZM").length;

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-1 gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold md:text-center sm:text-left">
          Tus cotizaciones
        </h1>
        <div className="flex w-full justify-center sm:w-auto sm:justify-end">
          <Link href="/dashboard/cotizaciones">
            <Button className="w-full bg-rojo-oland-100 hover:bg-azul-oland-100 sm:w-auto">
              Crear nueva cotización
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-6 text-w">
        <Card className="bg-azul-oland-100 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de cotizaciones
            </CardTitle>
            <CotizacionIcon width={24} height={24} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contarCotizaciones()}</div>
          </CardContent>
        </Card>

        <Card className="bg-azul-oland-100 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En proceso / Negociación</CardTitle>
            <PendienteIcon width={24} height={24} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contarPendientes()}</div>
          </CardContent>
        </Card>
        <Card className="bg-azul-oland-100 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inspección</CardTitle>
            <PendienteIcon width={24} height={24} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contarInspeccion()}</div>
          </CardContent>
        </Card>

          <Card className="bg-azul-oland-100 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emisión</CardTitle>
            <PendienteIcon width={24} height={24} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contarEmision()}</div>
          </CardContent>
        </Card>

        <Card className="bg-azul-oland-100 text-white">  
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisión pagada</CardTitle>
            <AprobadoIcon width={24} height={24}  />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contarComisionPagada()}</div>
          </CardContent>
        </Card>

        <Card className="bg-azul-oland-100 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cotización con comisión
            </CardTitle>
            <ValorAprobadoIcon width={24} height={24}  />
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

      <Card className="overflow-hidden  ">
        <div className="">
          <Table className="min-w-[560px] ">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-left">Título</TableHead>
                <TableHead className="text-center">Valor cotizado</TableHead>
                <TableHead className="text-center">Etapa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-muted-foreground"
                  >
                    Cargando cotizaciones...
                  </TableCell>
                </TableRow>
              ) : pageItems.length ? (
                pageItems.map((item, idx) => {
                  const formattedVehicleValue = formatUsdValue(item.UF_CRM_1757947153789);

                  return (
                    <TableRow key={item.ID}>
                      <TableCell className="text-center font-medium">
                        {items.length - (startIndex + idx)}
                      </TableCell>
                      <TableCell className="max-w-xs text-left">
                        <div className="truncate" title={item.TITLE}>
                          <Link href={`/${item.ID}`}>{item.TITLE}</Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {formattedVehicleValue ? (
                          <Badge variant="secondary" className="mx-auto w-fit">
                            {formattedVehicleValue}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground ">--</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.STAGE_ID ? (
                          <Badge variant="outline" className="mx-auto w-fit">
                            {stageLabels[item.STAGE_ID] ?? item.STAGE_ID}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No encontramos cotizaciones para mostrar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 border-t border-muted/20 p-4 md:flex-row md:items-center md:justify-between">
            <div className="text-center text-sm text-muted-foreground md:text-left">
            Página {page} de {totalPages}. Mostrando {pageItems.length} de {items.length}.
          </div>
          <div className="flex justify-center md:justify-end">
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