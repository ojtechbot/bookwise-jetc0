
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
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { addBook } from '@/services/book-service';

const addBookSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  author: z.string().min(3, 'Author must be at least 3 characters.'),
  category: z.string().min(2, 'Category must be at least 2 characters.'),
  summary: z.string().min(10, 'Summary must be at least 10 characters.'),
  authorInfo: z.string().min(10, 'Author info must be at least 10 characters.'),
  publishedYear: z.coerce.number().int().min(1000, 'Enter a valid year.'),
  totalCopies: z.coerce.number().int().min(1, 'There must be at least one copy.'),
  coverUrl: z.string().url('Please enter a valid image URL.'),
  hint: z.string().optional(),
});

type AddBookFormValues = z.infer<typeof addBookSchema>;

type AddBookDialogProps = {
  children: React.ReactNode;
  onBookAdded?: () => void;
};

export function AddBookDialog({ children, onBookAdded }: AddBookDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<AddBookFormValues>({
    resolver: zodResolver(addBookSchema),
    defaultValues: {
      title: '',
      author: '',
      category: '',
      summary: '',
      authorInfo: '',
      publishedYear: new Date().getFullYear(),
      totalCopies: 1,
      coverUrl: 'https://placehold.co/400x600.png',
      hint: '',
    },
  });

  const onSubmit = async (values: AddBookFormValues) => {
    setIsSubmitting(true);
    
    // Optimistically close the dialog and show success
    toast({
      title: 'Book Added!',
      description: `"${values.title}" has been added to the library.`,
    });
    onBookAdded?.();
    setIsOpen(false);
    form.reset();

    try {
      // Perform the async operation in the background
      await addBook(values);
    } catch (error) {
      console.error('Failed to add book:', error);
      // If it fails, show an error toast
      toast({
        title: 'Error',
        description: 'Could not add the book. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a New Book</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new book to the library catalog.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Book Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Author's Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief summary of the book..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="authorInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About the Author</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Information about the author..." {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Fiction" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="publishedYear"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Published Year</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="e.g., 2023" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="totalCopies"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Total Copies</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="e.g., 5" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="coverUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/cover.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="hint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image AI Hint</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., desert planet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">
                        Cancel
                    </Button>
                </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                Add Book
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
