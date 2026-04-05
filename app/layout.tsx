import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "production" 
      ? "https://essence-store.vercel.app" 
      : "http://localhost:3000"
  ),
  title: "Essence | Perfumes Importados e Cosméticos",
  description: "Explore nossa coleção exclusiva. Compre em até 3x no cartão ou com desconto no PIX. Entrega rápida para todo Brasil!",
  openGraph: {
    title: "Essence | Loja Oficial",
    description: "Catálogo completo de perfumes femininos, masculinos e skincare.",
    images: ['/logo.jpeg'],
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Essence Store',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>{children}</body>
    </html>
  );
}