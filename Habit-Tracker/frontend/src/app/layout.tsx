import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeRegistry } from "@/theme/ThemeRegistry";

import "./globals.css";

export const metadata: Metadata = {
  title: "Habit Tracker",
  description:
    "Sistema de gestión de hábitos y metas personales",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="es">
      <body>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}