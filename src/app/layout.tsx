import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Agentes Oland",
  description: "Cotiza con nosotros",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
         <Script
        src="https://unpkg.com/@bitrix24/b24jssdk@latest/dist/umd/index.min.js"
        strategy="afterInteractive"
        ></Script>
      </head>
      <body
        className={`${geistSans.variable} ${outfit.variable} ${geistMono.variable} antialiased`}  
      >
        {children}
      </body>
    </html>
  );
}
