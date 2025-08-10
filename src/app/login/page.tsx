
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { auth, signInWithEmailAndPassword } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, User, Briefcase, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { getUser } from "@/services/user-service";

const studentFormSchema = z.object({
  regNumber: z.string().min(1, "Registration number is required."),
  pin: z.string().min(4, "PIN must be at least 4 characters."),
});

const staffFormSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;
type StaffFormValues = z.infer<typeof staffFormSchema>;

const STUDENT_EMAIL_DOMAIN = 'student.libroweb.io';


export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const studentForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: { regNumber: "", pin: "" },
  });

  const staffForm = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const onStudentSubmit: SubmitHandler<StudentFormValues> = async (data) => {
    setIsPending(true);
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
      setIsPending(false);
    }
  };

  const onStaffSubmit: SubmitHandler<StaffFormValues> = async (data) => {
    setIsPending(true);
    try {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        
        toast({
            title: "Login Successful",
            description: "Welcome back!",
        });
        
        router.push('/admin');

    } catch (error: any) {
        console.error("Staff login failed:", error);
        let description = "An unexpected error occurred.";
        if (error.code) {
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    description = 'Invalid email or password.';
                    break;
                case 'auth/too-many-requests':
                    description = 'Access temporarily disabled due to too many failed login attempts. Please reset your password or try again later.';
                    break;
                default:
                    description = error.message;
            }
        }
        toast({
            title: "Login Failed",
            description,
            variant: "destructive",
        });
    } finally {
        setIsPending(false);
    }
  };


  return (
    <div className="container mx-auto flex items-center justify-center py-12 px-4 md:px-6 min-h-[calc(100vh-12rem)]">
      <Tabs defaultValue="student" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="student"><User className="mr-2 h-4 w-4" />Student</TabsTrigger>
          <TabsTrigger value="staff"><Briefcase className="mr-2 h-4 w-4" />Staff / Admin</TabsTrigger>
        </TabsList>
        <TabsContent value="student">
          <Card>
            <CardHeader>
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
                          <Input placeholder="e.g., 20240001" {...field} disabled={isPending} />
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
                            <Input type={showPin ? "text" : "password"} placeholder="****" {...field} disabled={isPending} />
                            </FormControl>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                onClick={() => setShowPin(!showPin)}
                            >
                                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">{showPin ? 'Hide PIN' : 'Show PIN'}</span>
                            </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                  </Button>
                </form>
              </Form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account? <Link href="/register" className="underline hover:text-primary">Register</Link>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Staff & Admin Login</CardTitle>
              <CardDescription>Use your institutional email and password to log in.</CardDescription>
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
                          <Input type="email" placeholder="name@example.com" {...field} disabled={isPending} />
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
                                <Input type={showPassword ? "text" : "password"} {...field} disabled={isPending} />
                            </FormControl>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                            </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                  </Button>
                </form>
              </Form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Forgot your password? <Link href="/forgot-password" className="underline hover:text-primary">Reset it</Link>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
