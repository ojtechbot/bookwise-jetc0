import { Book, Library, Search, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCard } from "@/components/book-card";
import Link from "next/link";

const latestBooks = [
  { id: '1', title: 'The Midnight Library', author: 'Matt Haig', coverUrl: 'https://placehold.co/300x450.png', hint: 'library book' },
  { id: '2', title: 'Project Hail Mary', author: 'Andy Weir', coverUrl: 'https://placehold.co/300x450.png', hint: 'space astronaut' },
  { id: '3', title: 'Klara and the Sun', author: 'Kazuo Ishiguro', coverUrl: 'https://placehold.co/300x450.png', hint: 'robot sun' },
  { id: '4', title: 'The Vanishing Half', author: 'Brit Bennett', coverUrl: 'https://placehold.co/300x450.png', hint: 'sisters portrait' },
];

const categories = [
  { name: 'Fiction', icon: Book },
  { name: 'Science', icon: Library },
  { name: 'History', icon: Tag },
  { name: 'Fantasy', icon: Book },
  { name: 'Biography', icon: Library },
  { name: 'Technology', icon: Tag },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full bg-primary/10 py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-primary">Welcome to Libroweb</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-foreground/80">
            Your digital gateway to a universe of knowledge. Discover, borrow, and read from our vast collection of ebooks.
          </p>
          <div className="mt-8 max-w-xl mx-auto">
            <form action="/search" method="GET" className="flex items-center gap-2">
              <Input
                type="search"
                name="q"
                placeholder="Search for books, authors, or subjects..."
                className="flex-grow text-base bg-card"
                aria-label="Search"
              />
              <Button type="submit" size="lg" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center font-headline text-primary">Latest Additions</h2>
          <p className="text-center mt-2 mb-8 text-foreground/70">Check out the newest books in our collection.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {latestBooks.map(book => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-primary/10 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center font-headline text-primary">Browse by Category</h2>
          <p className="text-center mt-2 mb-8 text-foreground/70">Explore books from your favorite genres.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link href={`/search?category=${category.name}`} key={category.name} className="group">
                <Card className="text-center hover:bg-accent/50 hover:border-accent transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex justify-center mb-2">
                      <category.icon className="w-10 h-10 text-accent group-hover:text-primary transition-colors" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
