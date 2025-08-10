
'use client';

import Link from "next/link";
import { BookMarked, LogIn, UserPlus, Menu, User, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "next-themes";

function ThemeSwitcher() {
    const { setTheme, theme } = useTheme();
    return (
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}


export function Header() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userProfile, isStudent, isLoading } = useAuth();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const isLoggedIn = !!user;

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
                {isLoggedIn && isStudent && <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>}
                {isLoggedIn && !isStudent && <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>}
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
          {isLoggedIn && isStudent && <Link href="/dashboard" className="text-foreground/70 hover:text-primary transition-colors">Dashboard</Link>}
           {isLoggedIn && !isStudent && <Link href="/admin" className="text-foreground/70 hover:text-primary transition-colors">Admin</Link>}
        </nav>
        <div className="flex items-center gap-4 ml-auto">
          <ThemeSwitcher />
          {isLoading ? null : isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={userProfile?.photoUrl ?? user.photoURL ?? undefined} alt={user.displayName ?? "User Avatar"} />
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || (isStudent ? 'Student' : 'Staff')}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {isStudent ? userProfile?.regNumber : user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={isStudent ? "/dashboard/settings" : "/admin"} className="flex items-center cursor-pointer">
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
