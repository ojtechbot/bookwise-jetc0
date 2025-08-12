
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Github, Linkedin, Loader2, Mail, Phone, User, Waypoints } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is too short.'),
  email: z.string().email('Invalid email address.'),
  subject: z.string().min(5, 'Subject is too short.'),
  message: z.string().min(10, 'Message is too short.'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
    const { toast } = useToast();
    const [isPending, setIsPending] = useState(false);

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: { name: '', email: '', subject: '', message: '' },
    });

    const onSubmit: SubmitHandler<ContactFormValues> = async (data) => {
        setIsPending(true);
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Contact form submitted:', data);
        toast({
            title: "Message Sent!",
            description: "Thank you for contacting us. We will get back to you shortly.",
        });
        form.reset();
        setIsPending(false);
    };

  return (
    <div className="container mx-auto py-16 px-4 md:px-6">
        <section className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">Contact Us</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-foreground/80">
            Have a question, suggestion, or just want to say hello? We'd love to hear from you.
          </p>
        </section>

        <div className="mt-16 grid md:grid-cols-2 gap-16 items-start">
            {/* Contact Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Send a Message</CardTitle>
                    <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl><Input type="email" placeholder="your.email@example.com" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl><Input placeholder="What is your message about?" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl><Textarea placeholder="Write your message here..." {...field} rows={5} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" disabled={isPending} className="w-full">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Message
                          </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

             {/* Developer Portfolio */}
            <div className="space-y-8">
                 <Card className="overflow-hidden">
                     <CardHeader className="p-0">
                         <Image 
                            src="https://placehold.co/600x250.png"
                            width={600}
                            height={250}
                            alt="Developer portfolio banner"
                            className="w-full h-auto"
                            data-ai-hint="code abstract"
                         />
                     </CardHeader>
                    <CardContent className="p-6 relative">
                        <Image
                            src="https://placehold.co/120x120.png"
                            alt="Pomari Osain Justin"
                            width={120}
                            height={120}
                            className="rounded-full border-4 border-background -mt-20 shadow-lg"
                            data-ai-hint="male developer portrait"
                        />
                         <h2 className="text-2xl font-bold mt-4">Pomari Osain Justin</h2>
                         <p className="font-semibold text-primary">CEO & Founder, APOJTech Group</p>
                         <p className="text-muted-foreground mt-2 text-sm">
                             A full-stack development company with tech and innovative ideas, transforming human ideas into reality and creativity with advanced solutions.
                         </p>
                         <Separator className="my-4" />
                         <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <a href="tel:08081428591" className="hover:text-primary">08081428591 (Call & WhatsApp)</a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a href="mailto:info@apojtech.com" className="hover:text-primary">info@apojtech.com</a>
                            </div>
                             <div className="flex items-center gap-3">
                                <Github className="h-4 w-4 text-muted-foreground" />
                                <a href="https://github.com/ojtechbot" target="_blank" rel="noopener noreferrer" className="hover:text-primary">github.com/ojtechbot</a>
                            </div>
                         </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Other ways to reach us</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-full"><Phone className="h-6 w-6 text-primary"/></div>
                            <div>
                                <h3 className="font-semibold">By Phone</h3>
                                <p className="text-muted-foreground text-sm">Mon-Fri, 9am - 5pm</p>
                                <a href="tel:+1234567890" className="text-primary hover:underline">+1 (234) 567-890</a>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-3 rounded-full"><Waypoints className="h-6 w-6 text-primary"/></div>
                            <div>
                                <h3 className="font-semibold">Our Office</h3>
                                <p className="text-muted-foreground text-sm">123 Library Lane, Knowledge City, 45678</p>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </div>
    </div>
  );
}

