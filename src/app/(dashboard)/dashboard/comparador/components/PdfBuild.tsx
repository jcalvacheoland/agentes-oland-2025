'use client';

import React from "react";
import { Page, Text, View, Document, StyleSheet, Image, Svg, Path } from "@react-pdf/renderer";
import type { ComparedPlanPayload } from "./comparisonModal";

export type PdfClientInfo = {
  cedula?: string;
  nombres?: string;
  apellidos?: string;
  primerApellido?: string;
  segundoApellido?: string;
  ciudad?: string;
  celular?: string;
  email?: string;
};

export type PdfVehicleInfo = {
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
  getValue: (plan: ComparedPlanPayload) => React.ReactNode;
};

const SECTION_LABEL_WIDTH = 92;
const ROW_LABEL_WIDTH = 168;

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
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
    borderColor: "#ffffff",
    paddingBottom: 14,
    marginBottom: 18,
  },
  headerTextGroup: {
    flex: 1,
  },
  tagline: {
    fontSize: 10,
    color: "#A60425",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    color: "#0b2240",
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
    backgroundColor: "#ffffff",
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
    color: "#0b2240",
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
    color: "#ffffff",
    fontWeight: 500,
  },
  table: {
    borderWidth: 1,
    borderColor: "#d8dce5",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f3f4f8",
    borderBottomWidth: 1,
    borderColor: "#d8dce5",
  },
  tableHeaderIntroCell: {
    width: SECTION_LABEL_WIDTH + ROW_LABEL_WIDTH,
    backgroundColor: "#0b2240",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  tableHeaderIntroText: {
    color: "#ffffff",
    fontSize: 5,
    fontWeight: 700,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  planHeaderCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  planHeaderDivider: {
    borderLeftWidth: 1,
    borderColor: "#d8dce5",
  },
  planLogo: {
    width: 42,
    height: 42,
    objectFit: "contain",
    marginBottom: 6,
  },
  planCarrier: {
    fontSize: 10,
    fontWeight: 700,
    color: "#0b2240",
    textTransform: "uppercase",
    textAlign: "center",
  },
  planName: {
    fontSize: 9,
    color: "#4a5163",
    marginTop: 3,
    textAlign: "center",
  },
  sectionContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#d8dce5",
  },
  sectionContainerBorderTop: {
    borderTopWidth: 1,
    borderColor: "#d8dce5",
  },
  sectionLabelCell: {
    width: SECTION_LABEL_WIDTH,
    backgroundColor: "#0b2240",
    borderRightWidth: 1,
    borderColor: "#d8dce5",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  sectionLabelInner: {
    justifyContent: "center",
    alignItems: "center",
  },
  sectionLabelText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    transform: "rotate(-90deg)",
  },
  sectionContent: {
    flex: 1,
  },
  dataRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#d8dce5",
    minHeight: 36,
  },
  lastDataRow: {
    borderBottomWidth: 0,
  },
  rowLabelCell: {
    width: ROW_LABEL_WIDTH,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f5f6fa",
    borderRightWidth: 1,
    borderColor: "#d8dce5",
    justifyContent: "center",
  },
  planCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  planCellDivider: {
    borderLeftWidth: 1,
    borderColor: "#d8dce5",
  },
  booleanIconWrapper: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  booleanIconSuccess: {
    backgroundColor: "#2ecc71",
  },
  booleanIconError: {
    backgroundColor: "#e74c3c",
  },
  pageBreakSpacer: {
    height: 18,
  },
  rowLabel: {
    fontSize: 9,
    color: "#4b5163",
    fontWeight: 700,
    textTransform: "uppercase",
    lineHeight: 1.3,
    textAlign: "left",
  },
  rowValue: {
    fontSize: 9,
    color: "#333740",
    lineHeight: 1.4,
    textAlign: "center",
  },
  footer: {
    marginTop: 20,
    fontSize: 9,
    color: "#4b5163",
    textAlign: "center",
  },
  footerHighlight: {
    color: "#A60425",
  },
});

interface PdfBuildProps {
  data: ComparedPlanPayload[];
  client?: PdfClientInfo | null;
  vehicle?: PdfVehicleInfo | null;
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

const normalizeBooleanString = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const coerceToBoolean = (value: string | boolean | null | undefined): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = normalizeBooleanString(value);
    if (!normalized || normalized === "-" || normalized === "0") return false;
    if (["no", "no disponible", "no aplica", "sin cobertura"].includes(normalized)) {
      return false;
    }
    if (["si", "incluido", "incluida", "disponible", "1", "aplica"].includes(normalized)) {
      return true;
    }
    return Boolean(normalized);
  }
  return Boolean(value);
};

const renderBooleanIcon = (value: string | boolean | null | undefined): React.ReactNode => {
  const isActive = coerceToBoolean(value);
  return (
    <View
      style={[
        styles.booleanIconWrapper,
        isActive ? styles.booleanIconSuccess : styles.booleanIconError,
      ]}
    >
      {isActive ? (
        <Svg width={10} height={10} viewBox="0 0 24 24">
          <Path
            d="M5 13l4 4L19 7"
            stroke="#ffffff"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : (
        <Svg width={10} height={10} viewBox="0 0 24 24">
          <Path
            d="M6 6l12 12M6 18L18 6"
            stroke="#ffffff"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </View>
  );
};

const normalizePlainText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const shouldBreakAfterRow = (sectionTitle: string, rowLabel: string): boolean => {
  return (
    normalizePlainText(sectionTitle) === "coberturas adicionales" &&
    normalizePlainText(rowLabel) === "perdida total por robo (sin dispositivo)"
  );
};

const formatInsurerName = (insurerKey: string | null | undefined): string => {
  if (typeof insurerKey !== "string") return "-";
  const trimmed = insurerKey.trim();
  if (!trimmed) return "-";
  return trimmed.toLowerCase() === "asur" ? "ASEGURADORA DEL SUR" : trimmed.toUpperCase();
};

const resolvePlanName = (plan: ComparedPlanPayload): string => {
  const normalizedName = normalizeStringValue(plan.planName);
  if (normalizedName !== "-") {
    return normalizedName;
  }
  return formatInsurerName(plan.insurerKey);
};

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const PdfBuild = ({ data, client, vehicle }: PdfBuildProps) => {
  const clientLocal = React.useMemo(
    () => client ?? readLocalStorageJson<PdfClientInfo>("clienteVehiculo"),
    [client]
  );
  const vehicleLocal = React.useMemo(
    () => vehicle ?? readLocalStorageJson<PdfVehicleInfo>("vehiculo"),
    [vehicle]
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
      label: "Pacto Andino",
      getValue: (plan) => renderBooleanIcon(plan.benefits.andeanPact),
    },
    {
      label: "Airbag",
      getValue: (plan) => renderBooleanIcon(plan.benefits.airbag),
    },
    {
      label: "Servicio de grua",
      getValue: (plan) => renderBooleanIcon(plan.benefits.towService),
    },
    {
      label: "Asistencia vehicular",
      getValue: (plan) => renderBooleanIcon(plan.benefits.vehicleAssistance),
    },
    {
      label: "Asistencia legal",
      getValue: (plan) => renderBooleanIcon(plan.benefits.legalAssistance),
    },
    {
      label: "Asistencia exequial",
      getValue: (plan) => renderBooleanIcon(plan.benefits.exequialAssistance),
    },
    {
      label: "Auto sustituto",
      getValue: (plan) => renderBooleanIcon(plan.benefits.substituteAuto),
    },
  ];

  const summaryRows: SectionRowConfig[] = [
    {
      label: "Prima neta",
      getValue: (plan) => formatCurrency(plan.netPremium),
    },
    {
      label: "Prima total",
      getValue: (plan) => formatCurrency(plan.pricing.totalPremium),
    },
    {
      label: "Pago mensual",
      getValue: (plan) => formatCurrency(plan.pricing.monthly),
    },
  ];

  const additionalRows: SectionRowConfig[] = [...deductiblesRows, ...benefitsRows];

  const sections: Array<{ title: string; rows: SectionRowConfig[] }> = [
    { title: "Coberturas principales", rows: coverageRows },
    { title: "Coberturas adicionales", rows: additionalRows },
    { title: "Costos", rows: summaryRows },
  ];

  const renderSection = (title: string, rows: SectionRowConfig[], isFirst: boolean) => (
    <View
      key={title}
      style={[
        styles.sectionContainer,
        ...(!isFirst ? [styles.sectionContainerBorderTop] : []),
      ]}
    >
      <View style={styles.sectionLabelCell}>
        <View style={styles.sectionLabelInner}>
          <Text style={styles.sectionLabelText}>{title.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.sectionContent}>
        {rows.map((row, rowIndex) => {
          const isLastRow = rowIndex === rows.length - 1;
          return (
            <React.Fragment key={`${title}-${row.label}`}>
              <View
                style={[
                  styles.dataRow,
                  ...(isLastRow ? [styles.lastDataRow] : []),
                ]}
              >
                <View style={styles.rowLabelCell}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                </View>
                {data.map((plan, idx) => {
                  const cellContent = row.getValue(plan);
                  const isPrimitive =
                    typeof cellContent === "string" || typeof cellContent === "number";

                  return (
                    <View
                      key={`${title}-${row.label}-${idx}`}
                      style={[
                        styles.planCell,
                        ...(idx !== 0 ? [styles.planCellDivider] : []),
                      ]}
                    >
                      {isPrimitive ? (
                        <Text style={styles.rowValue}>{String(cellContent)}</Text>
                      ) : (
                        cellContent
                      )}
                    </View>
                  );
                })}
              </View>
              {shouldBreakAfterRow(title, row.label) ? (
                <React.Fragment>
                  <View style={styles.pageBreakSpacer} />
                  <View break />
                  <View style={styles.pageBreakSpacer} />
                </React.Fragment>
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
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
              <Text style={styles.headerTitle}>Cotización de su seguro</Text>
              <Text style={styles.tagline}>Exclusivo para clientes de Agentes Oland</Text>
              
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
            <View style={styles.tableHeaderRow}>
              <View style={styles.tableHeaderIntroCell}>
                <Text style={styles.tableHeaderIntroText}>
                  Comparativo coberturas y costos
                </Text>
              </View>
              {data.map((plan, idx) => (
                <View
                  key={`plan-header-${plan.insurerKey}-${idx}`}
                  style={[
                    styles.planHeaderCell,
                    ...(idx !== 0 ? [styles.planHeaderDivider] : []),
                  ]}
                >
                  {plan.logoUrl ? <Image src={plan.logoUrl} style={styles.planLogo} /> : null}
                  <Text style={styles.planCarrier}>{formatInsurerName(plan.insurerKey)}</Text>
                  <Text style={styles.planName}>{resolvePlanName(plan)}</Text>
                </View>
              ))}
            </View>
            {sections.map((section, index) =>
              renderSection(section.title, section.rows, index === 0)
            )}
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

