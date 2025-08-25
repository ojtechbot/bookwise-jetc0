
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/auth-context';
import { type BorrowedBookInfo, getAllBorrowedBooks } from '@/services/user-service';
import { format } from 'date-fns';
import { BorrowedBookDetailsDialog } from '@/components/borrowed-book-details-dialog';
import { BookOpenCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function BorrowedBooksPage() {
  const router = useRouter();
  const { user, isStudent, isLoading: isAuthLoading } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBookInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<BorrowedBookInfo | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || isStudent) {
        router.push(isStudent ? '/dashboard' : '/login');
      } else {
        const fetchBorrowed = async () => {
          setIsLoading(true);
          try {
            const data = await getAllBorrowedBooks();
            setBorrowedBooks(data);
          } catch (error) {
            console.error("Failed to fetch borrowed books:", error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchBorrowed();
      }
    }
  }, [user, isStudent, isAuthLoading, router]);
  
  if (isAuthLoading) {
    return <div className="flex items-center justify-center min-h-screen"></div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary flex items-center gap-3">
            <BookOpenCheck className="h-10 w-10" />
            Borrowed Books
        </h1>
        <p className="text-lg text-muted-foreground">Track all books currently checked out by users.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Currently Borrowed Items</CardTitle>
          <CardDescription>Click on a row to view more details about the book and the borrower.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book Title</TableHead>
                  <TableHead>User Name</TableHead>
                  <TableHead>Reg. Number</TableHead>
                  <TableHead>Date Borrowed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        </TableRow>
                    ))
                ) : borrowedBooks.length > 0 ? (
                  borrowedBooks.map((item) => (
                    <TableRow key={`${item.user.uid}-${item.book.id}`} className="cursor-pointer" onClick={() => setSelectedBook(item)}>
                      <TableCell className="font-medium">{item.book.title}</TableCell>
                      <TableCell>{item.user.name}</TableCell>
                      <TableCell>{item.user.regNumber || 'N/A'}</TableCell>
                      <TableCell>{format(item.borrowed.borrowedDate.toDate(), 'PPP')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No books are currently borrowed.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {selectedBook && (
        <BorrowedBookDetailsDialog 
          borrowedInfo={selectedBook}
          isOpen={!!selectedBook}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedBook(null);
            }
          }}
        />
      )}
    </div>
  );
}
