
'use client';

import Link from "next/link";
import { BookMarked, LogIn, UserPlus, Menu, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
  const router = useRouter();
  // NOTE: This is a simulation of auth state. In a real app, you'd use a proper auth provider.
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogout = () => {
    // In a real app, you would clear auth state, tokens, etc.
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 md:px-6 flex items-center h-16">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
               <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                    <BookMarked className="h-6 w-6" />
                    <span>Libroweb</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-6 text-lg font-medium p-4">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <Link href="/search" className="hover:text-primary transition-colors">Search</Link>
                {isLoggedIn && <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>}
                {isLoggedIn && <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <Link href="/" className="flex items-center gap-2 mx-6 md:mr-6 md:ml-0">
          <BookMarked className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-primary font-headline">Libroweb</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-foreground/70 hover:text-primary transition-colors">Home</Link>
          <Link href="/search" className="text-foreground/70 hover:text-primary transition-colors">Search</Link>
          {isLoggedIn && <Link href="/dashboard" className="text-foreground/70 hover:text-primary transition-colors">Dashboard</Link>}
          {isLoggedIn && <Link href="/admin" className="text-foreground/70 hover:text-primary transition-colors">Admin</Link>}
        </nav>
        <div className="flex items-center gap-4 ml-auto">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Alex Johnson</p>
                    <p className="text-xs leading-none text-muted-foreground">Reg No: 20240001</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer">
                   <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <div className="flex items-center gap-2">
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
          )}
        </div>
      </div>
    </header>
  );
}
