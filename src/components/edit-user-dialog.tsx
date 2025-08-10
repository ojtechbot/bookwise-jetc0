
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateUserRole, type UserProfile, type UserRole } from '@/services/user-service';

const editUserSchema = z.object({
  role: z.enum(['student', 'librarian', 'admin'], {
    required_error: 'Please select a role.',
  }),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

type EditUserDialogProps = {
  children: React.ReactNode;
  user: UserProfile;
  onUserUpdated?: () => void;
};

export function EditUserDialog({ children, user, onUserUpdated }: EditUserDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      role: user.role,
    },
  });

  const onSubmit = (values: EditUserFormValues) => {
    startTransition(async () => {
      try {
        await updateUserRole(user.uid, values.role as UserRole);
        toast({
          title: 'User Updated!',
          description: `${user.name}'s role has been changed to ${values.role}.`,
        });
        onUserUpdated?.();
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to update user role:', error);
        toast({
          title: 'Error',
          description: 'Could not update the user. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Change the role for <span className="font-semibold">{user.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div>
                <Label>Email</Label>
                <Input value={user.email} disabled />
            </div>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} id="edit-user-form" className="space-y-4">
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="librarian">Librarian</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
             </Form>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="edit-user-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
