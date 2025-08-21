
'use client';

import { Book, Library, Search, Tag, Loader2, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { BookCard } from "@/components/book-card";
import Link from "next/link";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { getBook, Book as BookType } from "@/services/book-service";
import { useAuth } from '@/context/auth-context';
import { recommendBooks, type RecommendBooksOutput } from "@/ai/flows/recommend-books-flow";
import Image from "next/image";
import initialBooksData from '@/data/books.json';
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";


const categories = [
  { name: 'Fiction', icon: Book },
  { name: 'Science', icon: Library },
  { name: 'History', icon: Tag },
  { name: 'Fantasy', icon: Book },
  { name: 'Biography', icon: Library },
  { name: 'Technology', icon: Tag },
];

const allBooks: BookType[] = initialBooksData as unknown as BookType[];
const latestBooks = [...allBooks]
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 8);


export default function Home() {
  const { userProfile } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendBooksOutput['recommendations']>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);

  const autoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );
  
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
  }, [userProfile]);
  
  const popularBooks = useMemo(() => {
    // Sort by reviewCount in descending order and take the first 4
    return [...allBooks].sort((a,b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 4);
  }, [])

  const featuredBook = useMemo(() => {
    if (allBooks.length === 0) return null;
    // Find the book with the highest average rating
    return allBooks.reduce((prev, current) => (prev.averageRating || 0) > (current.averageRating || 0) ? prev : current);
  }, []);
  
  const recommendedBookDetails = useMemo(() => {
     if(!recommendations.length) return [];
     return recommendations.map(rec => {
        const book = allBooks.find(b => b.title === rec.title && b.author === rec.author);
        return book ? { ...book, reason: rec.reason } : null;
     }).filter((b): b is BookType & { reason: string } => b !== null);
  }, [recommendations]);


  return (
    <div className="flex flex-col items-center">
      <section className="w-full bg-primary/10 py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">Welcome to Foundation Polytechnic</h1>
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
                        priority
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
          {latestBooks.length > 0 ? (
            <Carousel
                plugins={[autoplayPlugin.current]}
                className="w-full"
                opts={{
                    align: "start",
                    loop: true,
                }}
                onMouseEnter={autoplayPlugin.current.stop}
                onMouseLeave={autoplayPlugin.current.reset}
                >
                <CarouselContent>
                    {latestBooks.map(book => (
                        <CarouselItem key={book.id} className="md:basis-1/2 lg:basis-1/4">
                            <div className="p-1">
                                <BookCard {...book} />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                 <CarouselPrevious className="hidden sm:flex" />
                 <CarouselNext className="hidden sm:flex" />
            </Carousel>
          ) : (
             <div className="flex justify-center">
                <p className="text-muted-foreground">Could not load latest books.</p>
             </div>
          )}
           <div className="mt-12 text-center">
              <Button asChild variant="outline" size="lg">
                  <Link href="/search">View All Books</Link>
              </Button>
          </div>
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
      
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-primary">Frequently Asked Questions</h2>
          <p className="text-center mt-2 mb-8 text-foreground/70">Find answers to common questions about our digital library.</p>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I register for an account?</AccordionTrigger>
              <AccordionContent>
                Students can register by clicking the "Get Started" button on the top right of the homepage and then "Register". You will need your full name and student registration number. Staff and admins are pre-registered and can log in with their provided credentials.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How do I borrow a book?</AccordionTrigger>
              <AccordionContent>
                To borrow a book, simply navigate to the book's detail page and click the "Borrow Book" button. The book will then be added to the "Borrowed" section of your student dashboard. You must be logged in to borrow a book.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How do I write a review?</AccordionTrigger>
              <AccordionContent>
                You can write a review for any book you have borrowed. On the book's detail page, you will find a "Write a review" section where you can give a star rating and leave a comment.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I request a book that isn't in the library?</AccordionTrigger>
              <AccordionContent>
                Yes! If you are a student, you can go to the "Requests" tab on your dashboard and fill out the form to request a new book. Our librarians will review the request.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
              <AccordionTrigger>Who do I contact for technical support?</AccordionTrigger>
              <AccordionContent>
                For any technical issues with the digital library, please visit the "Contact" page and reach out to us via the provided email or phone number during working hours.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
