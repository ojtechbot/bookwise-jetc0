
'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, Upload, User, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { generateAvatar } from '@/ai/flows/generate-avatar-flow';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updateProfile } from "firebase/auth";
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/services/user-service';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';

const profileFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email(),
});

export default function SettingsPage() {
  const { user, userProfile, isLoading } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isAvatarPending, startAvatarTransition] = useTransition();
  const [isProfilePending, startProfileTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: '', email: '' },
  });

  useEffect(() => {
    if (user) {
      setAvatarUrl(user.photoURL);
    }
    if (userProfile) {
      form.reset({ name: userProfile.name || '', email: userProfile.email || '' });
    }
  }, [user, userProfile, form]);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        // Here you would typically upload the file to a storage service like Firebase Storage
        // and then update the user's photoURL with the new URL.
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAvatar = () => {
    if (!prompt || !auth.currentUser) return;
    startAvatarTransition(async () => {
      try {
        const result = await generateAvatar({ prompt });
        if (result.imageUrl && auth.currentUser) {
          await updateProfile(auth.currentUser, { photoURL: result.imageUrl });
          setAvatarUrl(result.imageUrl);
          toast({ title: 'Avatar Updated!', description: 'Your new AI-generated avatar has been set.' });
        }
      } catch (error) {
        console.error('Failed to generate avatar:', error);
        toast({ title: 'Avatar Generation Failed', variant: 'destructive' });
      }
    });
  };

  const onSubmit = (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;
    startProfileTransition(async () => {
      try {
        await updateUser(user.uid, { name: values.name });
        await updateProfile(user, { displayName: values.name });
        toast({ title: 'Profile Updated!', description: 'Your changes have been saved successfully.' });
      } catch (error) {
        console.error('Failed to update profile:', error);
        toast({ title: 'Update Failed', description: 'Could not save your changes.', variant: 'destructive' });
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline text-primary">Profile Settings</h1>
        <p className="text-lg text-muted-foreground">Manage your account and profile details.</p>
      </header>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your avatar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Avatar className="h-40 w-40 border-4 border-primary/20">
                  <AvatarImage src={avatarUrl ?? undefined} alt="User Avatar" />
                  <AvatarFallback>
                    <User className="h-20 w-20" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <Label htmlFor="picture" className="sr-only">
                  Upload
                </Label>
                <Button asChild variant="outline" className="w-full">
                  <label htmlFor="picture-upload">
                    <Upload className="mr-2" /> Upload Photo
                  </label>
                </Button>
                <Input
                  id="picture-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="ai-prompt">Generate with AI</Label>
                <div className="flex gap-2">
                  <Input
                    id="ai-prompt"
                    placeholder="e.g., a cartoon astronaut"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isAvatarPending}
                  />
                  <Button onClick={handleGenerateAvatar} disabled={isAvatarPending || !prompt}>
                    {isAvatarPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    <span className="sr-only">Generate</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Describe the avatar you want to create.</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Edit your personal details.</CardDescription>
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
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
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
                        <FormControl>
                          <Input type="email" {...field} readOnly />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                  {userProfile?.regNumber && (
                    <div className="space-y-2">
                      <Label htmlFor="reg-number">Registration Number</Label>
                      <Input id="reg-number" value={userProfile.regNumber} readOnly />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={userProfile?.role} readOnly />
                  </div>
                  <Button type="submit" className="w-full md:w-auto" disabled={isProfilePending}>
                     {isProfilePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
