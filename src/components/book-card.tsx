import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

type BookCardProps = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  hint?: string;
};

export function BookCard({ id, title, author, coverUrl, hint }: BookCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
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
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg font-headline">
          <Link href={`/book/${id}`} className="hover:text-primary transition-colors">
            {title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">by {author}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" variant="secondary">
          <Link href={`/book/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
