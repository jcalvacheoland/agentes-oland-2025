import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import type { ComparedPlanPayload } from "./comparisonModal";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
  planBlock: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 6,
  },
  planName: {
    fontSize: 14,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  text: {
    fontSize: 10,
  },
});

interface PdfBuildProps {
  data: ComparedPlanPayload[];
}

export const PdfBuild = ({ data }: PdfBuildProps) => {
  // Recibimos la comparación normalizada para que el PDF refleje exactamente lo que mostraba el modal.
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Comparación de Planes</Text>
        {data.map((plan, idx) => (
          <View key={`${plan.insurerKey}-${idx}`} style={styles.planBlock}>
            <Text style={styles.planName}>
              {plan.planName} - {plan.insurerKey}
            </Text>
            <View style={styles.row}>
              <Text style={styles.text}>Prima total:</Text>
              <Text style={styles.text}>
                {plan.pricing.totalPremium !== null ? `$${plan.pricing.totalPremium.toFixed(2)}` : "-"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.text}>Prima mensual ({plan.pricing.period} pagos):</Text>
              <Text style={styles.text}>${plan.pricing.monthly.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.text}>Prima neta:</Text>
              <Text style={styles.text}>
                {plan.netPremium !== null ? `$${plan.netPremium.toFixed(2)}` : "-"}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Coberturas</Text>
            {Object.entries(plan.coverages).map(([label, value]) => (
              <View key={label} style={styles.row}>
                <Text style={styles.text}>{label}:</Text>
                <Text style={styles.text}>{typeof value === "boolean" ? (value ? "Incluido" : "No incluido") : value}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Deducibles</Text>
            {Object.entries(plan.deductibles).map(([label, value]) => (
              <View key={label} style={styles.row}>
                <Text style={styles.text}>{label}:</Text>
                <Text style={styles.text}>{typeof value === "boolean" ? (value ? "Incluido" : "No incluido") : value}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Beneficios</Text>
            {Object.entries(plan.benefits).map(([label, value]) => (
              <View key={label} style={styles.row}>
                <Text style={styles.text}>{label}:</Text>
                <Text style={styles.text}>{typeof value === "boolean" ? (value ? "Disponible" : "No disponible") : value}</Text>
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
};
