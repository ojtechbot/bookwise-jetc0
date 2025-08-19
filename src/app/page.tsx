
'use client';

import { Book, Library, Search, Tag, Loader2, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { BookCard } from "@/components/book-card";
import Link from "next/link";
import { useEffect, useState, useMemo, useCallback } from "react";
import { getBooks, getBook, Book as BookType } from "@/services/book-service";
import { useAuth } from '@/context/auth-context';
import { recommendBooks, type RecommendBooksOutput } from "@/ai/flows/recommend-books-flow";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";


const categories = [
  { name: 'Fiction', icon: Book },
  { name: 'Science', icon: Library },
  { name: 'History', icon: Tag },
  { name: 'Fantasy', icon: Book },
  { name: 'Biography', icon: Library },
  { name: 'Technology', icon: Tag },
];

export default function Home() {
  const [allBooks, setAllBooks] = useState<BookType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userProfile } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendBooksOutput['recommendations']>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const books = await getBooks();
        setAllBooks(books);
      } catch (error) {
        console.error("Failed to fetch latest books:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchRecommendations = useCallback(async () => {
    if (!userProfile || !userProfile.borrowedBooks || userProfile.borrowedBooks.length === 0 || allBooks.length === 0) {
      return;
    }

    setIsRecommendationsLoading(true);
    try {
      const history = await Promise.all(
        userProfile.borrowedBooks
          .map(async (b) => {
            const bookInfo = await getBook(b.bookId);
            return bookInfo ? {
              title: bookInfo.title,
              author: bookInfo.author,
              category: bookInfo.category,
            } : null;
          })
      );
      
      const validHistory = history.filter((item): item is {title: string, author: string, category: string} => item !== null);
      
      if(validHistory.length > 0) {
        const result = await recommendBooks({
          history: validHistory,
          allBooks: allBooks.map(({ title, author, category }) => ({ title, author, category }))
        });
        setRecommendations(result.recommendations);
      }

    } catch (error) {
      console.error("Failed to get recommendations:", error);
    } finally {
      setIsRecommendationsLoading(false);
    }
  }, [userProfile, allBooks]);
  
  const latestBooks = useMemo(() => {
    // Sort by createdAt timestamp in descending order and take the first 4
    return [...allBooks]
      .sort((a, b) => {
          const timeA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
      })
      .slice(0, 4);
  }, [allBooks]);
  
  const popularBooks = useMemo(() => {
    // Sort by reviewCount in descending order and take the first 4
    return [...allBooks].sort((a,b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 4);
  }, [allBooks])

  const featuredBook = useMemo(() => {
    if (allBooks.length === 0) return null;
    // Find the book with the highest average rating
    return allBooks.reduce((prev, current) => (prev.averageRating || 0) > (current.averageRating || 0) ? prev : current);
  }, [allBooks]);
  
  const recommendedBookDetails = useMemo(() => {
     if(!recommendations.length) return [];
     return recommendations.map(rec => {
        const book = allBooks.find(b => b.title === rec.title && b.author === rec.author);
        return book ? { ...book, reason: rec.reason } : null;
     }).filter((b): b is BookType & { reason: string } => b !== null);
  }, [recommendations, allBooks]);


  return (
    <div className="flex flex-col items-center">
      <section className="w-full bg-primary/10 py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">Welcome to Libroweb</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-foreground/80">
            Your digital gateway to a universe of knowledge. Discover, borrow, and read from our vast collection of ebooks.
          </p>
          <div className="mt-8 max-w-xl mx-auto">
            <form action="/search" method="GET" className="flex items-center gap-2">
              <Input
                type="search"
                name="q"
                placeholder="Search for books, authors, or subjects..."
                className="flex-grow bg-card"
                aria-label="Search"
              />
              <Button type="submit" size="lg" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {featuredBook && (
         <section className="w-full py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-bold text-center text-primary">Featured Book</h2>
                <p className="text-center mt-2 mb-8 text-foreground/70">Our top-rated pick for you this week.</p>
                <Card className="overflow-hidden md:grid md:grid-cols-2 md:gap-8 items-center">
                    <Image
                        src={featuredBook.coverUrl}
                        alt={`Cover of ${featuredBook.title}`}
                        width={600}
                        height={900}
                        className="w-full h-auto object-cover"
                        data-ai-hint={featuredBook.hint}
                    />
                    <div className="p-8">
                        <Badge variant="secondary">{featuredBook.category}</Badge>
                        <h3 className="text-3xl font-bold mt-2 font-headline">{featuredBook.title}</h3>
                        <p className="text-lg text-muted-foreground mt-1">by {featuredBook.author}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={i < (featuredBook.averageRating || 0) ? 'fill-current' : 'text-muted-foreground'} />
                                ))}
                            </div>
                             <span className="text-muted-foreground text-sm">({featuredBook.reviewCount || 0} reviews)</span>
                        </div>
                        <p className="mt-4 text-base text-foreground/80 leading-relaxed line-clamp-4">{featuredBook.summary}</p>
                        <Button asChild size="lg" className="mt-6">
                            <Link href={`/book/${featuredBook.id}`}>Learn More</Link>
                        </Button>
                    </div>
                </Card>
            </div>
         </section>
      )}
      
       {userProfile && userProfile.role === 'student' && (
        <section className="w-full py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                  <div className="text-center sm:text-left">
                    <h2 className="text-3xl font-bold text-primary">Recommended For You</h2>
                    <p className="text-foreground/70">Based on your borrowing history.</p>
                  </div>
                  <Button onClick={fetchRecommendations} disabled={isRecommendationsLoading || !userProfile.borrowedBooks || userProfile.borrowedBooks.length === 0}>
                    {isRecommendationsLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    <span className="ml-2 hidden sm:inline">Get Suggestions</span>
                  </Button>
                </div>
                {isRecommendationsLoading ? (
                    <div className="flex justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
                ) : recommendedBookDetails.length > 0 ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                     {recommendedBookDetails.map(book => (
                       <Card key={book.id} className="flex flex-col">
                          <BookCard {...book} />
                          <CardContent>
                              <CardDescription className="text-sm italic text-accent-foreground/80 mt-2">"{book.reason}"</CardDescription>
                          </CardContent>
                       </Card>
                     ))}
                   </div>
                ) : (
                    <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                      <p className="font-semibold">No recommendations yet.</p>
                      <p className="text-muted-foreground text-sm">Borrow and return some books, then click "Get Suggestions" to see personalized recommendations!</p>
                    </div>
                )}
            </div>
        </section>
       )}

      <section className="w-full py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center text-primary">
            Latest Additions
          </h2>
          <p className="text-center mt-2 mb-8 text-foreground/70">
            Check out the newest books added to our collection.
          </p>
          {isLoading ? (
             <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {latestBooks.map(book => (
                  <BookCard key={book.id} {...book} />
                ))}
              </div>
              <div className="mt-12 text-center">
                  <Button asChild variant="outline" size="lg">
                      <Link href="/search">View More</Link>
                  </Button>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="w-full bg-primary/10 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center text-primary">Browse by Category</h2>
          <p className="text-center mt-2 mb-8 text-foreground/70">Explore books from your favorite genres.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link href={`/search?category=${category.name}`} key={category.name} className="group">
                <Card className="text-center hover:bg-accent/50 hover:border-accent transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex justify-center mb-2">
                      <category.icon className="w-10 h-10 text-accent group-hover:text-primary transition-colors" />
                    </div>
                    <CardTitle className="text-lg font-medium">{category.name}</CardTitle>
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
