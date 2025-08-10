
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, BookOpen, Lightbulb, Loader2, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState, useTransition, useEffect } from 'react';
import { summarizeBook } from '@/ai/flows/summarize-book-flow';
import { getBook, borrowBook, returnBook, type Book } from '@/services/book-service';
import { useToast } from '@/hooks/use-toast';
import { getUser, type UserProfile } from '@/services/user-service';
import { useAuth } from '@/context/auth-context';

export default function BookDetailsPage({ params }: { params: { id: string } }) {
  const [book, setBook] = useState<Book | null>(null);
  const { user, userProfile, isLoading: isAuthLoading } = useAuth();
  const [localUserProfile, setLocalUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummaryPending, startSummaryTransition] = useTransition();
  const [isActionPending, startActionTransition] = useTransition();
  const [aiSummary, setAiSummary] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true);
      try {
        const bookData = await getBook(params.id);
        setBook(bookData);
      } catch (error) {
        console.error("Failed to fetch book data:", error);
        setBook(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [params.id]);
  
  useEffect(() => {
    setLocalUserProfile(userProfile);
  },[userProfile])


  const handleGenerateSummary = () => {
    if (!book) return;
    startSummaryTransition(async () => {
      try {
        const result = await summarizeBook({ title: book.title, author: book.author });
        setAiSummary(result.summary);
      } catch (error) {
        console.error("Failed to generate summary:", error);
        setAiSummary("Sorry, we couldn't generate a summary at this time.");
      }
    });
  };

  const handleBorrow = () => {
    if (!book || !user) return;
    startActionTransition(async () => {
        try {
            await borrowBook(book.id, user.uid);
            const updatedBook = await getBook(book.id);
            const updatedProfile = await getUser(user.uid);
            setBook(updatedBook);
            setLocalUserProfile(updatedProfile);
            toast({ title: 'Success!', description: `You have borrowed "${book.title}".` });
        } catch (error: any) {
            console.error("Failed to borrow book:", error);
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    });
  };

  const handleReturn = () => {
     if (!book || !user) return;
    startActionTransition(async () => {
        try {
            await returnBook(book.id, user.uid);
            const updatedBook = await getBook(book.id);
            const updatedProfile = await getUser(user.uid);
            setBook(updatedBook);
            setLocalUserProfile(updatedProfile);
            toast({ title: 'Success!', description: `You have returned "${book.title}".` });
        } catch (error: any) {
            console.error("Failed to return book:", error);
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    });
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <h1 className="text-4xl font-bold">Book not found</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Sorry, we couldn't find the book you were looking for.
        </p>
      </div>
    );
  }
  
  const isBorrowedByUser = localUserProfile?.borrowedBooks?.some(b => b.bookId === book.id && b.status === 'borrowed');
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="grid md:grid-cols-3 gap-8 md:gap-12">
        <div className="md:col-span-1">
          <Card className="overflow-hidden sticky top-24">
            <Image
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              width={400}
              height={600}
              className="w-full h-auto object-cover"
              data-ai-hint="classic novel"
            />
          </Card>
        </div>
        <div className="md:col-span-2">
          <Badge variant="secondary" className="mb-2">{book.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{book.title}</h1>
          <p className="mt-2 text-xl text-muted-foreground">by {book.author}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
             {isBorrowedByUser ? (
                 <Button size="lg" className="w-full sm:w-auto" onClick={handleReturn} disabled={isActionPending}>
                    {isActionPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <History className="mr-2 h-5 w-5" />}
                    Return Book
                </Button>
             ) : (
                <Button size="lg" className="w-full sm:w-auto" onClick={handleBorrow} disabled={!isAvailable || isActionPending}>
                   {isActionPending ? (
                       <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                   ) : (
                       <BookOpen className="mr-2 h-5 w-5" />
                   )}
                   {isAvailable ? 'Borrow Book' : 'Unavailable'}
                </Button>
             )}
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-5 w-5" /> Download eBook
            </Button>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-bold font-headline">Summary</h2>
            <p className="mt-4 text-lg leading-relaxed">{book.summary}</p>
          </div>
          <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="item-1">
              <AccordionTrigger onClick={() => !aiSummary && handleGenerateSummary()}>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  <span>AI-Powered TL;DR Summary</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed">
                {isSummaryPending ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating summary...</span>
                  </div>
                ) : (
                  aiSummary
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-bold font-headline">About the Author</h2>
            <p className="mt-4 text-lg leading-relaxed">{book.authorInfo}</p>
          </div>
           <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-bold font-headline">Details</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 text-lg">
                <div><span className="font-semibold">Published:</span> {book.publishedYear}</div>
                <div><span className="font-semibold">Available Copies:</span> {book.availableCopies}/{book.totalCopies}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
