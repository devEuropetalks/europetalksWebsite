import "@/app/globals.css";
import ClerkThemeProvider from "@/components/ClerkThemeProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { I18nextProvider } from "@/components/i18n-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EuropeTalks",
  description:
    "Join our community of Europeans sharing ideas, culture, and creating connections across borders.",
  icons: {
    icon: [
      {
        url: "/images/favicon.ico",
        sizes: "any",
      },
      {
        url: "/images/icon.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
    apple: {
      url: "/images/apple-touch-icon.png",
      sizes: "180x180",
    },
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://clerk.com" />
        <link rel="preconnect" href="https://api.clerk.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img.clerk.com" />
        <link rel="dns-prefetch" href="https://clerk.com" />
        <link rel="dns-prefetch" href="https://api.clerk.com" />
        
        {/* Preconnect to UploadThing */}
        <link rel="preconnect" href="https://uploadthing.com" />
        <link rel="dns-prefetch" href="https://uploadthing.com" />
        
        {/* Preconnect to fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className}`}>
        <NextSSRPlugin
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <ThemeProvider>
          <ClerkThemeProvider>
            <I18nextProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <Toaster />
              <SonnerToaster />
            </I18nextProvider>
          </ClerkThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
