
'use client';

import Link from "next/link";
import Image from "next/image";
import { LogIn, UserPlus, Menu, User, LogOut, Moon, Sun, Settings, Info, Mail, ChevronDown } from "lucide-react";
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
import { Separator } from "./ui/separator";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/');
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

  const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} className="hover:text-primary transition-colors text-base" onClick={() => setIsSheetOpen(false)}>
      {children}
    </Link>
  );

  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 md:px-6 flex items-center h-16">
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
               <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2 text-lg font-semibold" onClick={() => setIsSheetOpen(false)}>
                    <Image src="/images/logo.png" alt="Foundation Polytechnic Logo" width={160} height={40} className="h-8 w-auto" />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="py-4">
                {isLoggedIn && userProfile ? (
                    <div className="px-4 space-y-2 mb-4">
                        <Avatar className="h-16 w-16">
                             <AvatarImage src={userProfile?.photoUrl ?? user.photoURL ?? undefined} alt={user.displayName ?? "User Avatar"} />
                             <AvatarFallback>
                                <User className="h-8 w-8" />
                             </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{userProfile.name}</p>
                            <p className="text-sm text-muted-foreground">{isStudent ? userProfile.regNumber : userProfile.email}</p>
                        </div>
                    </div>
                ) : (
                    <div className="px-4">
                         <Collapsible>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between text-base font-medium">
                                    Get Started
                                    <ChevronDown />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-4 space-y-2 mt-2">
                               <Button asChild className="w-full justify-start" variant="ghost">
                                 <Link href="/login" onClick={() => setIsSheetOpen(false)}><LogIn className="mr-2 h-4 w-4" /> Login</Link>
                               </Button>
                               <Button asChild className="w-full justify-start" variant="ghost">
                                <Link href="/register" onClick={() => setIsSheetOpen(false)}><UserPlus className="mr-2 h-4 w-4" /> Register</Link>
                               </Button>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                )}
              </div>
              <Separator />
              <nav className="grid gap-4 text-lg font-medium p-4">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/search">Search</NavLink>
                <NavLink href="/about">About</NavLink>
                <NavLink href="/contact">Contact</NavLink>
                {isLoggedIn && isStudent && <NavLink href="/dashboard">Dashboard</NavLink>}
                {isLoggedIn && !isStudent && <NavLink href="/admin">Admin</NavLink>}
              </nav>
               <div className="mt-auto p-4">
                  {isLoggedIn && (
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" /> Log Out
                    </Button>
                  )}
               </div>
            </SheetContent>
          </Sheet>
        </div>
        <Link href="/" className="flex items-center gap-2 mx-6 md:mr-6 md:ml-0">
          <Image src="/images/logo.png" alt="Foundation Polytechnic Logo" width={180} height={45} className="h-10 w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-foreground/70 hover:text-primary transition-colors">Home</Link>
          <Link href="/search" className="text-foreground/70 hover:text-primary transition-colors">Search</Link>
          <Link href="/about" className="text-foreground/70 hover:text-primary transition-colors">About</Link>
          <Link href="/contact" className="text-foreground/70 hover:text-primary transition-colors">Contact</Link>
          {isLoggedIn && isStudent && <Link href="/dashboard" className="text-foreground/70 hover:text-primary transition-colors">Dashboard</Link>}
           {isLoggedIn && !isStudent && <Link href="/admin" className="text-foreground/70 hover:text-primary transition-colors">Admin</Link>}
        </nav>
        <div className="flex items-center gap-4 ml-auto">
          <ThemeSwitcher />
          {isLoading ? (
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
           ) : isLoggedIn ? (
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
                  <Link href={isStudent ? "/dashboard" : "/admin"} className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href={isStudent ? "/dashboard/settings" : "/admin/settings"} className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer">
                   <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <div className="hidden md:flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button>Get Started</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                             <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Login</Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                            <Link href="/register"><UserPlus className="mr-2 h-4 w-4" /> Register</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
