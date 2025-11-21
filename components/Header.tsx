"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PrefetchLink } from "./PrefetchLink";

export default function Header() {
  const pathname = usePathname();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  const isMember = user?.publicMetadata?.role === "member";
  const memberLanguages = user?.publicMetadata?.languages as
    | string[]
    | undefined;
  const { t } = useTranslation("header");

  const navLinks = [
    { href: "/", label: t("navigation.home") },
    { href: "/about", label: t("navigation.about") },
    { href: "/events", label: t("navigation.events") },
    { href: "/gallery", label: t("navigation.gallery") },
    { href: "/contact", label: t("navigation.contact") },
    ...(isAdmin ? [{ href: "/admin", label: t("navigation.admin") }] : []),
    ...(isMember && memberLanguages?.length
      ? [
          {
            href: "/member/translations",
            label: t("navigation.translations"),
          },
        ]
      : []),
    ...(isMember || isAdmin
      ? [{ href: "https://cloud.europetalks.eu", label: t("navigation.cloud") }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-blue-900">
      <div className="container flex h-14 items-center justify-between max-w-6xl mx-auto px-4">
        <PrefetchLink href="/" className="mr-4 flex items-center h-full">
          <Image
            src="/images/etlogo.png"
            alt="Logo"
            width={768}
            height={182}
            className="h-full w-auto object-contain"
            quality={100}
            priority={true}
          />
        </PrefetchLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map(({ href, label }) =>
            href.startsWith("http") ? (
              <a
                key={href}
                href={href}
                className="text-white hover:text-accent transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
              </a>
            ) : (
              <PrefetchLink
                key={href}
                href={href}
                className={`text-white hover:text-accent transition-colors ${
                  pathname === href ? "text-accent" : ""
                }`}
              >
                {label}
              </PrefetchLink>
            )
          )}
        </nav>

        <div className="flex items-center space-x-4">
          <LanguageSelector />
          <ThemeToggle />
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-white hover:text-accent transition-colors">
                <span className="hidden md:inline">{t("other.signIn")}</span>
                <LogIn className="h-5 w-5 md:hidden" />
              </button>
            </SignInButton>
          </SignedOut>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{t("other.menu")}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-6">
                {navLinks.map(({ href, label }) =>
                  href.startsWith("http") ? (
                    <a
                      key={href}
                      href={href}
                      className="text-foreground hover:text-accent transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {label}
                    </a>
                  ) : (
                    <PrefetchLink
                      key={href}
                      href={href}
                      className={`text-foreground hover:text-accent transition-colors ${
                        pathname === href ? "text-accent" : ""
                      }`}
                    >
                      {label}
                    </PrefetchLink>
                  )
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
