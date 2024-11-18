import { Facebook, Instagram, Mail, Youtube } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-background w-full h-64 bg-gray-900 flex justify-center items-center">
      <div className="container py-6">
        <div className="flex flex-col items-center gap-4">
          {/* Social Media Links */}
          <div className="flex space-x-6">
            <a
              href="https://www.facebook.com/europetalks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </a>
            <a
              href="https://www.youtube.com/channel/UCoRo0glOhBGz4qyKxj73STw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              <Youtube className="h-5 w-5" />
              <span className="sr-only">YouTube</span>
            </a>
            <a
              href="https://www.instagram.com/europetalksofficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a
              href="mailto:mail@europetalks.eu"
              className="text-accent hover:text-accent/80 transition-colors"
            >
              <Mail className="h-5 w-5" />
              <span className="sr-only">Email</span>
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <Link
              href="/legal-notice"
              className="hover:text-foreground transition-colors"
            >
              Legal Notice
            </Link>
            <span>•</span>
            <Link
              href="/privacy-policy"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
