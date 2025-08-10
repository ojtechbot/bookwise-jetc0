
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
import { Loader2 } from "lucide-react";
import { useState } from "react";

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

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const studentForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: { regNumber: "", pin: "" },
  });

  const staffForm = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const onStudentSubmit: SubmitHandler<StudentFormValues> = (data) => {
    console.log("Student login submitted", data);
    // This is a placeholder for student login
    toast({
      title: "Login Successful",
      description: "Welcome back, student!",
    });
    router.push('/dashboard');
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
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
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
          <TabsTrigger value="student">Student</TabsTrigger>
          <TabsTrigger value="staff">Staff / Admin</TabsTrigger>
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
                          <Input placeholder="e.g., 20240001" {...field} />
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
                        <FormControl>
                          <Input type="password" placeholder="****" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">Login</Button>
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
                          <Input type="email" placeholder="name@example.com" {...field} />
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
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
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
