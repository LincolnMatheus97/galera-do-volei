import type { Metadata } from "next";
import { Inter } from "next/font/google";
// @ts-ignore: missing type declarations for CSS imports; add a '*.d.ts' file to declare modules for CSS for a permanent fix
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Galera do Vôlei - EventSnyc",
  description: "Gerenciamento de eventos esportivos e sociais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
          <Toaster /> 
        </AuthProvider>
      </body>
    </html>
  );
}