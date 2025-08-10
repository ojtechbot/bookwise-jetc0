import Link from "next/link";
import { BookMarked, LogIn, UserPlus } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 md:px-6 flex items-center h-16">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <BookMarked className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-primary font-headline">Libroweb</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-foreground/70 hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/search" className="text-foreground/70 hover:text-primary transition-colors">
            Search
          </Link>
          <Link href="/dashboard" className="text-foreground/70 hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/admin" className="text-foreground/70 hover:text-primary transition-colors">
            Admin
          </Link>
        </nav>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
          <Button asChild>
            <Link href="/register">
              <UserPlus className="mr-2 h-4 w-4" />
              Register
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
