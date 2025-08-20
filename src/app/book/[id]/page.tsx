
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, BookOpen, Lightbulb, Loader2, History, Star, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState, useTransition, useEffect, useCallback, useMemo } from 'react';
import { summarizeBook } from '@/ai/flows/summarize-book-flow';
import { getReviews, type Book, submitReview } from '@/services/book-service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { ReviewForm } from '@/components/review-form';
import { ReviewList, type Review } from '@/components/review-list';
import { useParams } from 'next/navigation';
import allBooksData from '@/data/books.json';
import { useLibraryStore } from '@/store/library-store';

export default function BookDetailsPage() {
  const params = useParams<{ id: string }>();
  const { user, userProfile } = useAuth();
  const [isSummaryPending, startSummaryTransition] = useTransition();
  const [aiSummary, setAiSummary] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const { toast } = useToast();
  
  const { borrowedBooks, borrowBook: borrowBookAction, returnBook: returnBookAction } = useLibraryStore();
  const isBorrowedByUser = useMemo(() => borrowedBooks.includes(params.id), [borrowedBooks, params.id]);

  const book: Book | null = useMemo(() => {
    if (!params.id) return null;
    return (allBooksData as unknown as Book[]).find(b => b.id === params.id) || null;
  }, [params.id]);


  const fetchReviews = useCallback(async () => {
    if (!params.id) return;
    try {
      // Review fetching can remain as it might use a live database
      const reviewsData = await getReviews(params.id);
      setReviews(reviewsData as Review[]);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  }, [params.id]);


  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);
  
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
    if (!book) return;
    borrowBookAction(book.id);
    toast({ title: "Book Borrowed!", description: `You have borrowed "${book.title}".` });
  };

  const handleReturn = () => {
     if (!book) return;
    returnBookAction(book.id);
    toast({ title: "Book Returned!", description: `You have returned "${book.title}".` });
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!book || !user || !userProfile) return false;
    try {
      await submitReview(book.id, {
        userId: user.uid,
        userName: userProfile.name || "Anonymous",
        userAvatar: userProfile.photoUrl || "",
        rating,
        comment,
      });
      toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
      // Refresh reviews
      await fetchReviews();
      return true;
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      toast({ title: 'Error', description: "Could not submit your review. Please try again.", variant: 'destructive' });
      return false;
    }
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
  
  const isAvailable = book.availableCopies > 0;
  const hasUserReviewed = user ? reviews.some(r => r.userId === user.uid) : false;

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
              priority
            />
          </Card>
        </div>
        <div className="md:col-span-2">
          <Badge variant="secondary" className="mb-2">{book.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{book.title}</h1>
          <p className="mt-2 text-xl text-muted-foreground">by {book.author}</p>
            <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={i < (book.averageRating || 0) ? 'fill-current' : 'text-muted-foreground'} />
                    ))}
                </div>
                <span className="text-muted-foreground text-sm">({book.reviewCount || 0} reviews)</span>
            </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
             {isBorrowedByUser ? (
                 <Button size="lg" className="w-full sm:w-auto" onClick={handleReturn}>
                    <History className="mr-2 h-5 w-5" />
                    Return Book
                </Button>
             ) : (
                <Button size="lg" className="w-full sm:w-auto" onClick={handleBorrow} disabled={!isAvailable || !user}>
                   <BookOpen className="mr-2 h-5 w-5" />
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
          <Separator className="my-8" />
           <div>
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2"><MessageSquare /> Reviews</h2>
            {user && !hasUserReviewed && (
              <Card className="my-6">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">Write a review</h3>
                    <ReviewForm onSubmit={handleReviewSubmit} />
                </CardContent>
              </Card>
            )}
            <ReviewList reviews={reviews} />
          </div>
        </div>
      </div>
    </div>
  );
}
