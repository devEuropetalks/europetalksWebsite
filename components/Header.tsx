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
        <nav className="flex items-center space-x-6">
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
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
