import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/navigation/BottomNav";

export const metadata: Metadata = {
  title: "Kily - Valorisez vos talents",
  description: "Plateforme de mise en avant des talents bruts sans barrière de diplôme",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}


