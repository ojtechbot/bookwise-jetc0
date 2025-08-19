
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
import { useState } from "react";

const studentFormSchema = z.object({
  regNumber: z.string().min(1, "Registration number is required."),
  pin: z.string().min(4, "PIN must be at least 4 characters."),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

const STUDENT_EMAIL_DOMAIN = 'student.libroweb.io';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const studentForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: { regNumber: "", pin: "" },
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

  return (
    <div className="container mx-auto flex items-center justify-center py-12 px-4 md:px-6 min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-md">
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
           <p className="mt-2 text-center text-xs text-muted-foreground">
             Staff? <Link href="/forgot-password" className="underline hover:text-primary">Reset password</Link> to log in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
