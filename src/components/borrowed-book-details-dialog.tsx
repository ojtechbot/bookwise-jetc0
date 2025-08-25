
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { type BorrowedBookInfo } from '@/services/user-service';
import Image from 'next/image';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, Book, Calendar, Mail, Hash } from 'lucide-react';
import { Separator } from './ui/separator';

interface BorrowedBookDetailsDialogProps {
  borrowedInfo: BorrowedBookInfo | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function BorrowedBookDetailsDialog({ borrowedInfo, isOpen, onOpenChange }: BorrowedBookDetailsDialogProps) {
  if (!borrowedInfo) return null;

  const { book, user, borrowed } = borrowedInfo;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Borrowed Book Details</DialogTitle>
          <DialogDescription>
            Information about the book and the user who borrowed it.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-8 py-4">
          {/* Book Details */}
          <div className="space-y-4">
             <h3 className="text-lg font-semibold flex items-center gap-2 text-primary"><Book /> Book Information</h3>
             <div className="flex gap-4 items-start">
                <Image
                    src={book.coverUrl}
                    alt={`Cover of ${book.title}`}
                    width={100}
                    height={150}
                    className="rounded-md object-cover"
                />
                <div className="space-y-1">
                    <p className="font-bold text-xl">{book.title}</p>
                    <p className="text-muted-foreground">by {book.author}</p>
                    <p className="text-sm text-muted-foreground pt-2">{book.summary.substring(0, 150)}...</p>
                </div>
             </div>
          </div>
          
          {/* User & Borrowing Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary"><User /> Borrower Information</h3>
            <div className="flex gap-4 items-center">
                 <Avatar className="h-16 w-16">
                    <AvatarImage src={user.photoUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                     <p className="font-bold text-xl">{user.name}</p>
                     <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {user.email}</p>
                     {user.regNumber && <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Hash className="h-3 w-3" /> {user.regNumber}</p>}
                </div>
            </div>
            <Separator />
             <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <strong>Borrowed Date:</strong>
                    <span>{format(borrowed.borrowedDate.toDate(), 'PPP')}</span>
                </div>
                <div className="flex items-center gap-2">
                     <Calendar className="h-4 w-4 text-muted-foreground" />
                    <strong>Due Date:</strong>
                     <span>{format(borrowed.dueDate.toDate(), 'PPP')}</span>
                </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

