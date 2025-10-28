import "pdfkit";

declare module "pdfkit" {
  interface ColumnStyle {
    align?: "left" | "center" | "right" | "justify";
  }
}
