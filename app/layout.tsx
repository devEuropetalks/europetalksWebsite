import "@/app/globals.css";
import ClerkThemeProvider from "@/components/ClerkThemeProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { I18nextProvider } from "@/components/i18n-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { TranslationsProvider } from "@/components/providers/TranslationsProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

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
      <body className={`${inter.className}`}>
        <ThemeProvider>
          <ClerkThemeProvider>
            <I18nextProvider>
              <TranslationsProvider>
                <Header />
                <main className="min-h-screen">{children}</main>
                <Footer />
                <Toaster />
                <SonnerToaster />
              </TranslationsProvider>
            </I18nextProvider>
          </ClerkThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
