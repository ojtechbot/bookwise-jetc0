
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
import { useTransition, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateBook, type Book } from '@/services/book-service';

const editBookSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  author: z.string().min(3, 'Author must be at least 3 characters.'),
  category: z.string().min(2, 'Category must be at least 2 characters.'),
  summary: z.string().min(10, 'Summary must be at least 10 characters.'),
  authorInfo: z.string().min(10, 'Author info must be at least 10 characters.'),
  publishedYear: z.coerce.number().int().min(1000, 'Enter a valid year.'),
  totalCopies: z.coerce.number().int().min(1, 'There must be at least one copy.'),
  coverUrl: z.string().url('Please enter a valid image URL.'),
});

type EditBookFormValues = z.infer<typeof editBookSchema>;

type EditBookDialogProps = {
  children: React.ReactNode;
  book: Book;
  onBookEdited?: () => void;
};

export function EditBookDialog({ children, book, onBookEdited }: EditBookDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<EditBookFormValues>({
    resolver: zodResolver(editBookSchema),
    defaultValues: {
      title: book.title,
      author: book.author,
      category: book.category,
      summary: book.summary,
      authorInfo: book.authorInfo,
      publishedYear: book.publishedYear,
      totalCopies: book.totalCopies,
      coverUrl: book.coverUrl,
    },
  });

  const onSubmit = (values: EditBookFormValues) => {
    startTransition(async () => {
      try {
        await updateBook(book.id, values);
        toast({
          title: 'Book Updated!',
          description: `"${values.title}" has been updated successfully.`,
        });
        onBookEdited?.();
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to update book:', error);
        toast({
          title: 'Error',
          description: 'Could not update the book. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Book Details</DialogTitle>
          <DialogDescription>
            Update the information for "{book.title}".
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
                    <Textarea placeholder="A brief summary of the book..." {...field} />
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
                    <Textarea placeholder="Information about the author..." {...field} />
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

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">
                        Cancel
                    </Button>
                </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
