
'use client';

import { BookCard } from "@/components/book-card";
import AiSearchSuggestions from "@/components/ai-search-suggestions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useTransition, useEffect, useMemo } from "react";
import { searchBooks } from "@/ai/flows/search-books-flow";
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBooks, type Book } from "@/services/book-service";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [author, setAuthor] = useState(searchParams.get('author') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [aiReasoning, setAiReasoning] = useState('');
  const [isAiSearchPending, startAiSearchTransition] = useTransition();

  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const books = await getBooks();
        setAllBooks(books);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setAuthor(searchParams.get('author') || '');
    setCategory(searchParams.get('category') || '');
    setAiReasoning('');
  }, [searchParams]);

  const handleAdvancedSearch = (searchQuery: string) => {
    startAiSearchTransition(async () => {
      try {
        const result = await searchBooks({ query: searchQuery });
        const params = new URLSearchParams();
        if (result.query) params.set('q', result.query);
        if (result.author) params.set('author', result.author);
        if (result.category) params.set('category', result.category);
        
        router.push(`/search?${params.toString()}`);
        setAiReasoning(result.reasoning);

      } catch (error) {
        console.error("Advanced search failed:", error);
        setAiReasoning('Sorry, the advanced search is not available right now.');
      }
    });
  };
  
  const updateQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  }

  const filteredResults = useMemo(() => {
    return allBooks.filter(book => {
      const queryLower = query.toLowerCase();
      const matchesQuery = query ? book.title.toLowerCase().includes(queryLower) || book.author.toLowerCase().includes(queryLower) : true;
      const matchesAuthor = author ? book.author === author : true;
      const matchesCategory = category ? book.category === category : true;
      return matchesQuery && matchesAuthor && matchesCategory;
    });
  }, [allBooks, query, author, category]);

  const uniqueAuthors = useMemo(() => [...new Set(allBooks.map(book => book.author))].sort(), [allBooks]);
  const uniqueCategories = useMemo(() => [...new Set(allBooks.map(book => book.category))].sort(), [allBooks]);


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary">Search the Library</h1>
        <p className="text-lg text-muted-foreground">Find your next great read. Try a natural language query like "sci-fi books by isaac asimov".</p>
      </header>
      
      <div className="mb-8 space-y-4">
        <AiSearchSuggestions initialQuery={query} onAdvancedSearch={handleAdvancedSearch} isPending={isAiSearchPending} />
         {isAiSearchPending && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Thinking...</span>
          </div>
        )}
        {aiReasoning && (
           <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>AI Search Assistant</AlertTitle>
            <AlertDescription>
              {aiReasoning}
            </AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="author-filter">Author</Label>
            <Select value={author} onValueChange={(value) => updateQueryParam('author', value === 'all' ? '' : value)}>
              <SelectTrigger id="author-filter">
                <SelectValue placeholder="Filter by author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {uniqueAuthors.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="category-filter">Category</Label>
            <Select value={category} onValueChange={(value) => updateQueryParam('category', value === 'all' ? '' : value)}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
           <div className="flex items-end">
            <Button variant="outline" onClick={() => router.push('/search')} className="w-full sm:w-auto">
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold">Results {filteredResults.length > 0 ? `(${filteredResults.length})` : ''}</h2>
        {isLoading ? (
           <div className="flex justify-center mt-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
           </div>
        ) : filteredResults.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {filteredResults.map(book => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-muted-foreground">No books found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}
