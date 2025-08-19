
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Star, BookOpen } from 'lucide-react';

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

    const handleBorrow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Firestore logic removed as per request.
        // This can be replaced with client-side logic if needed.
        console.log("Borrow button clicked for:", title);
        alert(`Borrowing "${title}" (simulation).`);
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
        <Button size="icon" className="absolute top-2 right-2 rounded-full h-8 w-8" onClick={handleBorrow}>
            <BookOpen className="h-4 w-4" />
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
