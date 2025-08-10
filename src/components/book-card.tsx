
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Star, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { borrowBook } from '@/services/book-service';
import { useState, useTransition } from 'react';

type BookCardProps = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  hint?: string;
  averageRating?: number;
  reviewCount?: number;
};

export function BookCard({ id, title, author, coverUrl, hint, averageRating = 0, reviewCount = 0 }: BookCardProps) {
    const { user, refreshUserProfile } = useAuth();
    const { toast } = useToast();
    const [isActionPending, startActionTransition] = useTransition();

    const handleBorrow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast({ title: 'Login Required', description: 'Please log in to borrow a book.', variant: 'destructive' });
            return;
        }
        startActionTransition(async () => {
            try {
                await borrowBook(id, user.uid);
                await refreshUserProfile();
                toast({ title: 'Success!', description: `You have borrowed "${title}".` });
            } catch (error: any) {
                console.error("Failed to borrow book:", error);
                toast({ title: 'Error', description: error.message, variant: 'destructive' });
            }
        });
    }

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Link href={`/book/${id}`} className="block">
          <Image
            src={coverUrl}
            alt={`Cover of ${title}`}
            width={300}
            height={450}
            className="w-full h-auto object-cover aspect-[2/3]"
            data-ai-hint={hint}
          />
        </Link>
        <Button size="icon" className="absolute top-2 right-2 rounded-full h-8 w-8" onClick={handleBorrow} disabled={isActionPending}>
            {isActionPending ? <Loader2 className="animate-spin h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
            <span className="sr-only">Borrow</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg font-medium">
          <Link href={`/book/${id}`} className="hover:text-primary transition-colors">
            {title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">by {author}</p>
        <div className="flex items-center gap-1 mt-2">
            <Star className={`w-4 h-4 ${averageRating > 0 ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
            <span className="text-xs text-muted-foreground">
                {averageRating > 0 ? `${averageRating.toFixed(1)} (${reviewCount})` : 'No reviews'}
            </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" variant="secondary">
          <Link href={`/book/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
