import type { Metadata, ResolvingMetadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { themeBody } from "@/theme";
import { languages } from "@/i18n/settings";
import { fetchUserServer } from "@/lib/api/users/fetchUserServer";
import { Theme } from "@/contexts/AppThemeContext";
import { cookies } from "next/headers";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export async function generateMetadata(
  { params }: { params: Promise<any> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;
  const baseUrl = parentMetadata.alternates?.canonical?.url || process.env.NEXT_PUBLIC_APP_URL || "https://photon.org";
  const { lng } = await params;

  return {
    alternates: {
      canonical: `${baseUrl}/${lng}`,
      languages: {
        "en": `${baseUrl}/en`,
        "pt-BR": `${baseUrl}/pt-BR`,
        "x-default": `${baseUrl}/en`,
      }
    }
  };
}

async function LocaleLayout(
  {
    children,
    params
  }: Readonly<{
    children: React.ReactNode;
    params: Promise<any>;
  }>) {
  const { lng } = await params;
  const { user } = await fetchUserServer()

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme')?.value;
  const validThemes: Theme[] = ['light', 'dark', 'system'];
  const initialTheme = validThemes.includes(themeCookie as Theme)
    ? (themeCookie as Theme)
    : 'system';

  return (
    <html lang={lng} className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-app-bg`}
        style={themeBody}
      >
        <Providers lang={lng} user={user} theme={initialTheme}>
          {children}
        </Providers>
      </body>
    </html>
  );
}

export default LocaleLayout