
'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, Upload, User, Loader2, KeyRound } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { generateAvatar } from '@/ai/flows/generate-avatar-flow';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/services/user-service';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';

const profileFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const changePinSchema = z.object({
    currentPin: z.string().min(6, "Your current PIN is required."),
    newPin: z.string().min(6, "New PIN must be at least 6 characters."),
    confirmPin: z.string()
}).refine(data => data.newPin === data.confirmPin, {
    message: "New PINs do not match.",
    path: ["confirmPin"],
});

type ChangePinFormValues = z.infer<typeof changePinSchema>;


export default function SettingsPage() {
  const { user, userProfile, isLoading, refreshUserProfile } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [promptText, setPromptText] = useState('');
  const [isAvatarPending, startAvatarTransition] = useTransition();
  const [isProfilePending, startProfileTransition] = useTransition();
  const [isPinPending, startPinTransition] = useTransition();
  const { toast } = useToast();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: '', email: '' },
  });

  const pinForm = useForm<ChangePinFormValues>({
    resolver: zodResolver(changePinSchema),
    defaultValues: { currentPin: '', newPin: '', confirmPin: '' },
  });

  useEffect(() => {
    if (user) {
      setAvatarUrl(user.photoURL);
    }
    if (userProfile) {
      profileForm.reset({ name: userProfile.name || '', email: userProfile.email || '' });
    }
  }, [user, userProfile, profileForm]);
  
  const updateAuthAndDbProfile = async (updates: { displayName?: string, photoURL?: string }) => {
    if (!auth.currentUser) throw new Error("No authenticated user found.");
    
    // Update Firebase Auth profile
    await updateProfile(auth.currentUser, updates);
    
    // Update Firestore user profile
    const dbUpdates: Partial<{name: string, photoUrl: string}> = {};
    if (updates.displayName) dbUpdates.name = updates.displayName;
    if (updates.photoURL) dbUpdates.photoUrl = updates.photoURL;
    
    if (Object.keys(dbUpdates).length > 0) {
      await updateUser(auth.currentUser.uid, dbUpdates);
    }
    
    await refreshUserProfile();
  }


  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      startAvatarTransition(async () => {
        try {
          // In a real app, you would upload this file to Firebase Storage
          // and get a URL back. For this example, we'll use a Data URL.
          const reader = new FileReader();
          reader.onloadend = async () => {
            const dataUrl = reader.result as string;
            await updateAuthAndDbProfile({ photoURL: dataUrl });
            setAvatarUrl(dataUrl);
            toast({ title: 'Avatar Updated!', description: 'Your new avatar has been set.' });
          };
          reader.readAsDataURL(file);
        } catch (error) {
           console.error('Failed to upload avatar:', error);
           toast({ title: 'Avatar Upload Failed', variant: 'destructive' });
        }
      });
    }
  };

  const handleGenerateAvatar = () => {
    if (!promptText || !auth.currentUser) return;
    startAvatarTransition(async () => {
      try {
        const result = await generateAvatar({ prompt: promptText });
        if (result.imageUrl) {
          await updateAuthAndDbProfile({ photoURL: result.imageUrl });
          setAvatarUrl(result.imageUrl);
          toast({ title: 'Avatar Updated!', description: 'Your new AI-generated avatar has been set.' });
        }
      } catch (error) {
        console.error('Failed to generate avatar:', error);
        toast({ title: 'Avatar Generation Failed', description: 'Please try a different prompt.', variant: 'destructive' });
      }
    });
  };

  const onProfileSubmit = (values: ProfileFormValues) => {
    if (!user || values.name === userProfile?.name) return;
    startProfileTransition(async () => {
      try {
        await updateAuthAndDbProfile({ displayName: values.name });
        toast({ title: 'Profile Updated!', description: 'Your name has been saved successfully.' });
      } catch (error) {
        console.error('Failed to update profile:', error);
        toast({ title: 'Update Failed', description: 'Could not save your changes.', variant: 'destructive' });
      }
    });
  };

  const onPinSubmit = (values: ChangePinFormValues) => {
    if (!user) return;
    startPinTransition(async () => {
      try {
        const credential = EmailAuthProvider.credential(user.email!, values.currentPin);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, values.newPin);
        pinForm.reset();
        toast({ title: 'PIN Updated!', description: 'Your PIN has been changed successfully.' });
      } catch (error: any) {
        console.error("Failed to update PIN:", error);
        let description = "Could not update your PIN. Please try again.";
        if (error.code === 'auth/wrong-password') {
            description = "The current PIN you entered is incorrect.";
        }
         if (error.code === 'auth/too-many-requests') {
            description = "Too many attempts. Please try again later.";
        }
        toast({ title: 'PIN Update Failed', description, variant: 'destructive' });
      }
    })
  }
  
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
        <div className="md:col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your avatar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                 <div className="relative">
                    <Avatar className="h-40 w-40 border-4 border-primary/20">
                    <AvatarImage src={avatarUrl ?? undefined} alt="User Avatar" />
                    <AvatarFallback>
                        <User className="h-20 w-20" />
                    </AvatarFallback>
                    </Avatar>
                     {isAvatarPending && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                            <Loader2 className="h-10 w-10 animate-spin text-white" />
                        </div>
                    )}
                 </div>
              </div>
              <div>
                <Button asChild variant="outline" className="w-full">
                  <label htmlFor="picture-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" /> Upload Photo
                  </label>
                </Button>
                <Input
                  id="picture-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isAvatarPending}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="ai-prompt">Generate with AI</Label>
                <div className="flex gap-2">
                  <Input
                    id="ai-prompt"
                    placeholder="e.g., a cartoon astronaut"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    disabled={isAvatarPending}
                  />
                  <Button onClick={handleGenerateAvatar} disabled={isAvatarPending || !promptText} size="icon">
                    {isAvatarPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                    <span className="sr-only">Generate</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Describe the avatar you want to create.</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Edit your personal details.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isProfilePending}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} readOnly disabled />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                  {userProfile?.regNumber && (
                    <div className="space-y-2">
                      <Label htmlFor="reg-number">Registration Number</Label>
                      <Input id="reg-number" value={userProfile.regNumber} readOnly disabled />
                       <p className="text-xs text-muted-foreground">Registration number cannot be changed. Please contact an admin for assistance.</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={userProfile?.role} readOnly disabled className="capitalize"/>
                  </div>
                  <Button type="submit" className="w-full md:w-auto" disabled={isProfilePending || !profileForm.formState.isDirty}>
                     {isProfilePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

           {userProfile?.role === 'student' && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><KeyRound /> Security</CardTitle>
                    <CardDescription>Change your student PIN.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...pinForm}>
                        <form onSubmit={pinForm.handleSubmit(onPinSubmit)} className="space-y-4">
                            <FormField
                                control={pinForm.control}
                                name="currentPin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current PIN</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} disabled={isPinPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={pinForm.control}
                                name="newPin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New PIN</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} disabled={isPinPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={pinForm.control}
                                name="confirmPin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New PIN</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} disabled={isPinPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isPinPending}>
                                {isPinPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Change PIN
                            </Button>
                        </form>
                    </Form>
                </CardContent>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
}

    