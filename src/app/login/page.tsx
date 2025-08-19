
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { auth, signInWithEmailAndPassword } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import defaultStaff from '@/data/staff.json';
import { ensureDefaultUsers } from "@/services/user-service";

const studentFormSchema = z.object({
  regNumber: z.string().min(1, "Registration number is required."),
  pin: z.string().min(4, "PIN must be at least 4 characters."),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

const staffFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

const STUDENT_EMAIL_DOMAIN = 'student.libroweb.io';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isStudent, isLoading } = useAuth();

  const [isStudentPending, setIsStudentPending] = useState(false);
  const [isStaffPending, setIsStaffPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  useEffect(() => {
    if (!isLoading && user) {
        if (isStudent) {
            router.push('/dashboard');
        } else {
            router.push('/admin');
        }
    }
  }, [user, isStudent, isLoading, router]);


  const studentForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: { regNumber: "", pin: "" },
  });

  const staffForm = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const onStudentSubmit: SubmitHandler<StudentFormValues> = async (data) => {
    setIsStudentPending(true);
    const studentEmail = `${data.regNumber}@${STUDENT_EMAIL_DOMAIN}`;
    try {
      await signInWithEmailAndPassword(auth, studentEmail, data.pin);
       toast({
        title: "Login Successful",
        description: "Welcome back, student!",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Student login failed:", error);
       toast({
        title: "Login Failed",
        description: "Invalid registration number or PIN.",
        variant: "destructive",
      });
    } finally {
      setIsStudentPending(false);
    }
  };

  const onStaffSubmit: SubmitHandler<StaffFormValues> = async (data) => {
    setIsStaffPending(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push('/admin');
    } catch (error: any) {
      console.error("Staff login failed:", error);
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setIsStaffPending(false);
    }
  }

  const handleQuickLogin = async (staffMember: typeof defaultStaff[0]) => {
    setIsStaffPending(true);
    try {
        // Ensure default users exist before attempting login
        await ensureDefaultUsers();
        staffForm.setValue('email', staffMember.email);
        staffForm.setValue('password', staffMember.password);
        await onStaffSubmit({ email: staffMember.email, password: staffMember.password });
    } catch (error) {
        console.error("Quick login setup failed:", error);
        toast({
            title: "Setup Error",
            description: "Could not ensure default users exist. Please try again.",
            variant: "destructive"
        });
        setIsStaffPending(false);
    }
  }

  if (isLoading || user) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="container mx-auto flex items-center justify-center py-12 px-4 md:px-6 min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-md">
        <Tabs defaultValue="student">
            <CardHeader>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="student">Student</TabsTrigger>
                    <TabsTrigger value="staff">Staff / Admin</TabsTrigger>
                </TabsList>
            </CardHeader>
            <TabsContent value="student">
                <CardHeader className="pt-0">
                    <CardTitle className="font-headline">Student Login</CardTitle>
                    <CardDescription>Enter your registration number and PIN to access your dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...studentForm}>
                    <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
                    <FormField
                        control={studentForm.control}
                        name="regNumber"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Registration Number</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., 20240001" {...field} disabled={isStudentPending} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={studentForm.control}
                        name="pin"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>PIN</FormLabel>
                            <div className="relative">
                                <FormControl>
                                <Input type={showPassword ? "text" : "password"} placeholder="****" {...field} disabled={isStudentPending} />
                                </FormControl>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    <span className="sr-only">{showPassword ? 'Hide PIN' : 'Show PIN'}</span>
                                </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isStudentPending}>
                        {isStudentPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Login
                    </Button>
                    </form>
                </Form>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    Don't have an account? <Link href="/register" className="underline hover:text-primary">Register</Link>
                </p>
                </CardContent>
            </TabsContent>
            <TabsContent value="staff">
                <CardHeader className="pt-0">
                    <CardTitle className="font-headline">Staff Login</CardTitle>
                    <CardDescription>Enter your email and password to access the admin dashboard.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Form {...staffForm}>
                        <form onSubmit={staffForm.handleSubmit(onStaffSubmit)} className="space-y-4">
                        <FormField
                            control={staffForm.control}
                            name="email"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                <Input type="email" placeholder="admin@libroweb.io" {...field} disabled={isStaffPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={staffForm.control}
                            name="password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <div className="relative">
                                <FormControl>
                                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isStaffPending} />
                                </FormControl>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isStaffPending}>
                            {isStaffPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Login
                        </Button>
                        </form>
                    </Form>
                     <Alert className="mt-4">
                        <AlertTitle>Quick Login (For Setup)</AlertTitle>
                        <AlertDescription>
                            Use these to create and access staff accounts.
                        </AlertDescription>
                        <div className="mt-2 space-y-2">
                             {defaultStaff.map(staff => (
                                <Button key={staff.name} variant="outline" size="sm" className="w-full" onClick={() => handleQuickLogin(staff)} disabled={isStaffPending}>
                                    {isStaffPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Log in as {staff.name}
                                </Button>
                            ))}
                        </div>
                     </Alert>
                     <p className="mt-4 text-center text-sm text-muted-foreground">
                        <Link href="/forgot-password" className="underline hover:text-primary">Forgot password?</Link>
                    </p>
                 </CardContent>
            </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
