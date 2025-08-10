
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { auth, createUserWithEmailAndPassword, updateProfile } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { addUser } from '@/services/user-service';

const registerFormSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  regNumber: z.string().optional().or(z.literal('')),
  role: z.enum(["student", "staff"], { required_error: "You must select a role." }),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
}).refine((data) => {
    if (data.role === 'staff') return !!data.email;
    return true;
}, {
    message: "Email is required for staff members.",
    path: ["email"],
}).refine((data) => {
    if (data.role === 'student') return !!data.regNumber;
    return true;
}, {
    message: "Registration number is required for students.",
    path: ["regNumber"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

const STUDENT_EMAIL_DOMAIN = 'student.libroweb.io';

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      regNumber: "",
      password: "",
      confirmPassword: "",
    }
  });

  const selectedRole = form.watch("role");

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setIsPending(true);
    try {
      const email = data.role === 'staff'
        ? data.email!
        : `${data.regNumber}@${STUDENT_EMAIL_DOMAIN}`;

      const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: data.fullName });

      await addUser({
        uid: user.uid,
        name: data.fullName,
        email: user.email!,
        role: data.role as 'student' | 'staff',
        regNumber: data.regNumber || null,
      });

      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please log in.",
      });
      router.push('/login');
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: error.code === 'auth/email-already-in-use' ? 'This account already exists.' : (error.message || "An unexpected error occurred."),
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
          <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
          <CardDescription>Join Libroweb to access thousands of digital resources.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a...</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="staff">Staff Member</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedRole === 'staff' && (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedRole === 'student' && (
                <FormField
                  control={form.control}
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
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{selectedRole === 'student' ? 'PIN (must be at least 6 characters)' : 'Password'}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{selectedRole === 'student' ? 'Confirm PIN' : 'Confirm Password'}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="underline hover:text-primary">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
