
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, Upload, User, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { generateAvatar } from '@/ai/flows/generate-avatar-flow';

export default function SettingsPage() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>('https://github.com/shadcn.png');
  const [prompt, setPrompt] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAvatar = () => {
    if (!prompt) return;
    startTransition(async () => {
      try {
        const result = await generateAvatar({ prompt });
        if (result.imageUrl) {
          setAvatarUrl(result.imageUrl);
        }
      } catch (error) {
        console.error('Failed to generate avatar:', error);
      }
    });
  };

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
                    disabled={isPending}
                  />
                  <Button onClick={handleGenerateAvatar} disabled={isPending || !prompt}>
                    {isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Alex Johnson" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="alex@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-number">Registration Number</Label>
                <Input id="reg-number" defaultValue="20240001" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input defaultValue="Student" readOnly />
              </div>
              <Button className="w-full md:w-auto">Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
