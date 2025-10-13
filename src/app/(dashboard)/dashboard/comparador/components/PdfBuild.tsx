'use client';

import React from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import type { ComparedPlanPayload } from "./comparisonModal";

type ClientLocalStorage = {
  cedula?: string;
  nombres?: string;
  apellidos?: string;
  primerApellido?: string;
  segundoApellido?: string;
  ciudad?: string;
  celular?: string;
  email?: string;
};

type VehicleLocalStorage = {
  marca?: string;
  modelo?: string;
  anio?: number | string;
  avaluo?: number | string;
  avaluoOriginal?: number | string;
  placa?: string;
  tipoUso?: string;
};

type SectionRowConfig = {
  label: string;
  getValue: (plan: ComparedPlanPayload) => string;
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: "#f2f4f8",
    fontFamily: "Helvetica",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderColor: "#d8dce5",
    paddingBottom: 14,
    marginBottom: 18,
  },
  headerTextGroup: {
    flex: 1,
  },
  tagline: {
    fontSize: 10,
    color: "#d94f4f",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    color: "#1c2a53",
    fontWeight: 700,
    lineHeight: 1.4,
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#5a6278",
    marginTop: 4,
    textTransform: "uppercase",
  },
  topLogo: {
    width: 70,
    height: 70,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#f3f6fb",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d8dce5",
  },
  infoCardLeft: {
    marginRight: 12,
  },
  infoCardTitle: {
    fontSize: 11,
    color: "#0b3d91",
    fontWeight: 700,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    width: 120,
    fontSize: 9,
    color: "#6b7285",
    textTransform: "uppercase",
  },
  infoValue: {
    flex: 1,
    fontSize: 10,
    color: "#1f2433",
    fontWeight: 500,
  },
  table: {
    borderWidth: 1,
    borderColor: "#d8dce5",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#d8dce5",
  },
  tableHeaderRow: {
    backgroundColor: "#e9eef7",
  },
  categoryCell: {
    width: 150,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderColor: "#d8dce5",
    justifyContent: "center",
  },
  planCell: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  headerPlanCell: {
    alignItems: "center",
  },
  planCarrier: {
    fontSize: 10,
    fontWeight: 700,
    color: "#0b3d91",
    textTransform: "uppercase",
  },
  planName: {
    fontSize: 9,
    color: "#4a5163",
    marginTop: 3,
    textAlign: "center",
  },
  sectionRow: {
    flexDirection: "row",
  },
  sectionLabelCell: {
    width: 150,
    backgroundColor: "#0b3d91",
    paddingVertical: 7,
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRightWidth: 1,
    borderColor: "#d8dce5",
  },
  sectionLabelText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  sectionSpacerCell: {
    backgroundColor: "#f5f7fb",
  },
  rowLabel: {
    fontSize: 9,
    color: "#2d3243",
    fontWeight: 600,
  },
  rowValue: {
    fontSize: 9,
    color: "#333740",
    lineHeight: 1.4,
  },
  summaryRow: {
    backgroundColor: "#f1f3f8",
  },
  summaryLabelCell: {
    width: 150,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderColor: "#d8dce5",
    justifyContent: "center",
  },
  summaryLabelText: {
    fontSize: 9,
    color: "#0b3d91",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  footer: {
    marginTop: 20,
    fontSize: 9,
    color: "#4b5163",
    textAlign: "center",
  },
  footerHighlight: {
    color: "#d94f4f",
  },
});

interface PdfBuildProps {
  data: ComparedPlanPayload[];
}

const readLocalStorageJson = <T,>(key: string): T | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const normalizeStringValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "-";
  const str = String(value).trim();
  if (!str) return "-";
  return str.replace(/\/\*\/?/g, "").replace(/\s+/g, " ");
};

const formatCoverageValue = (value: string | boolean | null | undefined): string => {
  if (typeof value === "boolean") {
    return value ? "Incluido" : "No incluido";
  }
  return normalizeStringValue(value);
};

const formatBenefitValue = (value: string | boolean | null | undefined): string => {
  if (typeof value === "boolean") {
    return value ? "Disponible" : "No disponible";
  }
  return normalizeStringValue(value);
};

const formatDeductibleValue = (value: string | boolean | null | undefined): string => {
  if (typeof value === "boolean") {
    return value ? "Incluido" : "No incluido";
  }
  return normalizeStringValue(value);
};

const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "-";
  const amount = Number(value);
  if (Number.isNaN(amount)) return "-";
  return `$${amount.toFixed(2)}`;
};

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const PdfBuild = ({ data }: PdfBuildProps) => {
  const clientLocal = React.useMemo(
    () => readLocalStorageJson<ClientLocalStorage>("clienteVehiculo"),
    []
  );
  const vehicleLocal = React.useMemo(
    () => readLocalStorageJson<VehicleLocalStorage>("vehiculo"),
    []
  );

  const fullName = React.useMemo(() => {
    if (!clientLocal) return "-";
    const nameParts = [
      clientLocal.nombres,
      clientLocal.apellidos ||
        [clientLocal.primerApellido, clientLocal.segundoApellido].filter(Boolean).join(" "),
    ].filter(Boolean);
    const name = nameParts.join(" ").trim();
    return name || "-";
  }, [clientLocal]);

  const clientCedula = clientLocal?.cedula ? normalizeStringValue(clientLocal.cedula) : "-";
  const clientCity = clientLocal?.ciudad ? normalizeStringValue(clientLocal.ciudad) : "-";
  const clientPhone = clientLocal?.celular ? normalizeStringValue(clientLocal.celular) : "-";
  const clientEmail = clientLocal?.email ? normalizeStringValue(clientLocal.email) : "-";

  const vehicleBrand = vehicleLocal?.marca ? normalizeStringValue(vehicleLocal.marca) : "-";
  const vehicleModel = vehicleLocal?.modelo ? normalizeStringValue(vehicleLocal.modelo) : "-";
  const vehicleYear = vehicleLocal?.anio ? normalizeStringValue(vehicleLocal.anio) : "-";
  const vehicleValue = formatCurrency(
    vehicleLocal?.avaluo ?? vehicleLocal?.avaluoOriginal ?? null
  );
  const quoteDate = formatDate(new Date());

  const coverageRows: SectionRowConfig[] = [
    {
      label: "Responsabilidad civil",
      getValue: (plan) => formatCoverageValue(plan.coverages.civilLiability),
    },
    {
      label: "Muerte accidental",
      getValue: (plan) => formatCoverageValue(plan.coverages.accidentalDeath),
    },
    {
      label: "Gastos médicos",
      getValue: (plan) => formatCoverageValue(plan.coverages.medicalExpenses),
    },
  ];

  const deductiblesRows: SectionRowConfig[] = [
    {
      label: "Pérdida parcial",
      getValue: (plan) => formatDeductibleValue(plan.deductibles.partialLoss),
    },
    {
      label: "Pérdida total por daño",
      getValue: (plan) => formatDeductibleValue(plan.deductibles.totalLossDamage),
    },
    {
      label: "Pérdida total por robo (con dispositivo)",
      getValue: (plan) => formatDeductibleValue(plan.deductibles.totalLossTheftWithDevice),
    },
    {
      label: "Pérdida total por robo (sin dispositivo)",
      getValue: (plan) => formatDeductibleValue(plan.deductibles.totalLossTheftWithoutDevice),
    },
  ];

  const benefitsRows: SectionRowConfig[] = [
    {
      label: "Cobertura patrimonial",
      getValue: (plan) => formatBenefitValue(plan.benefits.patrimonialCoverage),
    },
    {
      label: "Airbag",
      getValue: (plan) => formatBenefitValue(plan.benefits.airbag),
    },
    {
      label: "Servicio de grúa",
      getValue: (plan) => formatBenefitValue(plan.benefits.towService),
    },
    {
      label: "Asistencia vehicular",
      getValue: (plan) => formatBenefitValue(plan.benefits.vehicleAssistance),
    },
    {
      label: "Asistencia legal",
      getValue: (plan) => formatBenefitValue(plan.benefits.legalAssistance),
    },
    {
      label: "Asistencia exequial",
      getValue: (plan) => formatBenefitValue(plan.benefits.exequialAssistance),
    },
    {
      label: "Auto sustituto",
      getValue: (plan) => formatBenefitValue(plan.benefits.substituteAuto),
    },
  ];

  const renderSection = (title: string, rows: SectionRowConfig[]) => (
    <React.Fragment key={title}>
      <View style={styles.sectionRow}>
        <View style={styles.sectionLabelCell}>
          <Text style={styles.sectionLabelText}>{title.toUpperCase()}</Text>
        </View>
        {data.map((_, idx) => (
          <View key={`${title}-spacer-${idx}`} style={[styles.planCell, styles.sectionSpacerCell]} />
        ))}
      </View>
      {rows.map((row) => (
        <View key={`${title}-${row.label}`} style={styles.tableRow}>
          <View style={styles.categoryCell}>
            <Text style={styles.rowLabel}>{row.label}</Text>
          </View>
          {data.map((plan, idx) => (
            <View key={`${title}-${row.label}-${idx}`} style={[styles.planCell, { borderLeftWidth: idx === 0 ? 0 : 1, borderColor: "#d8dce5" }]}>
              <Text style={styles.rowValue}>{row.getValue(plan)}</Text>
            </View>
          ))}
        </View>
      ))}
    </React.Fragment>
  );

  const renderSummaryRow = (label: string, getValue: (plan: ComparedPlanPayload) => string) => (
    <View key={`summary-${label}`} style={[styles.tableRow, styles.summaryRow]}>
      <View style={styles.summaryLabelCell}>
        <Text style={styles.summaryLabelText}>{label.toUpperCase()}</Text>
      </View>
      {data.map((plan, idx) => (
        <View
          key={`summary-${label}-${idx}`}
          style={[
            styles.planCell,
            { borderLeftWidth: idx === 0 ? 0 : 1, borderColor: "#d8dce5" },
          ]}
        >
          <Text style={styles.rowValue}>{getValue(plan)}</Text>
        </View>
      ))}
    </View>
  );

  if (!data || data.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.container}>
            <Text>No existen planes para mostrar.</Text>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.tagline}>Exclusivo para clientes de Agentes Oland</Text>
              <Text style={styles.headerTitle}>Cotización de su seguro</Text>
              <Text style={styles.headerSubtitle}>Comparativo de coberturas y costos</Text>
            </View>
            <Image src="/img/agentesLogo.jpg" style={styles.topLogo} />
          </View>

          {/* Client & Vehicle info */}
          <View style={styles.infoRow}>
            <View style={[styles.infoCard, styles.infoCardLeft]}>
              <Text style={styles.infoCardTitle}>Datos del cliente</Text>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Nombre completo</Text>
                <Text style={styles.infoValue}>{fullName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Cédula</Text>
                <Text style={styles.infoValue}>{clientCedula}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ciudad</Text>
                <Text style={styles.infoValue}>{clientCity}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Celular</Text>
                <Text style={styles.infoValue}>{clientPhone}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Correo</Text>
                <Text style={styles.infoValue}>{clientEmail}</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Datos del vehículo</Text>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Marca</Text>
                <Text style={styles.infoValue}>{vehicleBrand}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Modelo</Text>
                <Text style={styles.infoValue}>{vehicleModel}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Año</Text>
                <Text style={styles.infoValue}>{vehicleYear}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Valor asegurado</Text>
                <Text style={styles.infoValue}>{vehicleValue}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fecha de cotización</Text>
                <Text style={styles.infoValue}>{quoteDate}</Text>
              </View>
            </View>
          </View>

          {/* Comparison table */}
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <View style={styles.categoryCell}>
                <Text style={styles.rowLabel}>Comparativo coberturas y costos</Text>
              </View>
              {data.map((plan, idx) => (
                <View
                  key={`header-${plan.insurerKey}-${idx}`}
                  style={[styles.planCell, styles.headerPlanCell, { borderLeftWidth: idx === 0 ? 0 : 1, borderColor: "#d8dce5" }]}
                >
                  <Text style={styles.planCarrier}>{plan.insurerKey.toUpperCase()}</Text>
                  <Text style={styles.planName}>{plan.planName}</Text>
                </View>
              ))}
            </View>

            {renderSection("Coberturas principales", coverageRows)}
            {renderSection("Deducibles", deductiblesRows)}
            {renderSection("Coberturas adicionales", benefitsRows)}

            {renderSummaryRow("Prima neta", (plan) => formatCurrency(plan.netPremium))}
            {renderSummaryRow("Prima total", (plan) => formatCurrency(plan.pricing.totalPremium))}
            {renderSummaryRow("Prima mensual", (plan) => {
              const monthly = formatCurrency(plan.pricing.monthly);
              const period = plan.pricing.period;
              if (!period || monthly === "-") return monthly;
              return `${monthly} x ${period} pagos`;
            })}
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            AGENTES DE SEGUROS ECUADOR - <Text style={styles.footerHighlight}>OLAND SEGUROS</Text>
          </Text>
        </View>
      </Page>
    </Document>
  );
};
