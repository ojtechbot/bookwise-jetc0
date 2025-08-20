
import Link from "next/link";
import { UserLocation } from "./user-location";

export function Footer() {
  return (
    <footer className="bg-primary/10 py-6 mt-16">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between text-sm text-foreground/60">
        <p className="order-2 md:order-1 mt-4 md:mt-0">&copy; {new Date().getFullYear()} Foundation Polytechnic. All rights reserved.</p>
        <div className="order-1 md:order-2 flex flex-col md:flex-row items-center gap-4">
             <nav className="flex gap-4">
                <Link href="/about" className="hover:text-primary transition-colors">
                    About
                </Link>
                 <Link href="/contact" className="hover:text-primary transition-colors">
                    Contact
                </Link>
                <Link href="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                </Link>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                </Link>
            </nav>
            <UserLocation />
        </div>
      </div>
    </footer>
  );
}
