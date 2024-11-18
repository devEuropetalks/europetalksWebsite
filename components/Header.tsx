"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

export default function Header() {
  const pathname = usePathname();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  const isMember = user?.publicMetadata?.role === "member";

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/events", label: "Events" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
    ...(isAdmin ? [{ href: "/admin/events", label: "Admin" }] : []),
    ...(isMember || isAdmin
      ? [{ href: "https://cloud.europetalks.eu", label: "Cloud" }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-blue-900">
      <div className="container flex h-14 items-center justify-between max-w-6xl mx-auto px-4">
        <Link href="/" className="mr-4 h-full">
          <Image
            src="/images/etlogo.png"
            alt="Logo"
            width={100}
            height={100}
            className="h-full w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-white hover:text-accent transition-colors ${
                pathname === href ? "text-accent" : ""
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <LanguageSelector />
          <ThemeToggle />
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-white hover:text-accent transition-colors">
                <span className="hidden md:inline">Sign in</span>
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
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-6">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`text-foreground hover:text-accent transition-colors ${
                      pathname === href ? "text-accent" : ""
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
