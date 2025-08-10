
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteBook } from '@/services/book-service';

type DeleteBookDialogProps = {
  children: React.ReactNode;
  bookId: string;
  bookTitle: string;
  onBookDeleted?: () => void;
};

export function DeleteBookDialog({ children, bookId, bookTitle, onBookDeleted }: DeleteBookDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteBook(bookId);
        toast({
          title: 'Book Deleted!',
          description: `"${bookTitle}" has been removed from the library.`,
        });
        onBookDeleted?.();
      } catch (error) {
        console.error('Failed to delete book:', error);
        toast({
          title: 'Error',
          description: 'Could not delete the book. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the book
            <span className="font-semibold"> "{bookTitle}" </span>
            and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} asChild>
             <Button variant="destructive">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, delete book
             </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
