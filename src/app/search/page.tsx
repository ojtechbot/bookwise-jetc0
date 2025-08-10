
'use client';

import { BookCard } from "@/components/book-card";
import AiSearchSuggestions from "@/components/ai-search-suggestions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useTransition, useEffect } from "react";
import { searchBooks } from "@/ai/flows/search-books-flow";
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const searchResults = [
  { id: '1', title: 'Dune', author: 'Frank Herbert', coverUrl: 'https://placehold.co/300x450.png', hint: 'desert planet', category: 'Sci-Fi', year: 1965 },
  { id: '2', title: 'Foundation', author: 'Isaac Asimov', coverUrl: 'https://placehold.co/300x450.png', hint: 'galaxy empire', category: 'Sci-Fi', year: 1951 },
  { id: '3', title: 'Brave New World', author: 'Aldous Huxley', coverUrl: 'https://placehold.co/300x450.png', hint: 'future society', category: 'Dystopian', year: 1932 },
  { id: '4', title: '1984', author: 'George Orwell', coverUrl: 'https://placehold.co/300x450.png', hint: 'dystopian future', category: 'Dystopian', year: 1949 },
  { id: '5', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', coverUrl: 'https://placehold.co/300x450.png', hint: 'fantasy map', category: 'Fantasy', year: 1954 },
  { id: '6', title: 'To Kill a Mockingbird', author: 'Harper Lee', coverUrl: 'https://placehold.co/300x450.png', hint: 'courtroom novel', category: 'Classic Literature', year: 1960 },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [author, setAuthor] = useState(searchParams.get('author') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [aiReasoning, setAiReasoning] = useState('');
  const [isAiSearchPending, startAiSearchTransition] = useTransition();

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

  const filteredResults = searchResults.filter(book => {
    const queryLower = query.toLowerCase();
    const matchesQuery = query ? book.title.toLowerCase().includes(queryLower) || book.author.toLowerCase().includes(queryLower) : true;
    const matchesAuthor = author ? book.author === author : true;
    const matchesCategory = category ? book.category === category : true;
    return matchesQuery && matchesAuthor && matchesCategory;
  });

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline text-primary">Search the Library</h1>
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
          <div className="w-full sm:w-1/3">
            <Label htmlFor="author-filter">Author</Label>
            <Select value={author} onValueChange={(value) => updateQueryParam('author', value)}>
              <SelectTrigger id="author-filter">
                <SelectValue placeholder="Filter by author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Authors</SelectItem>
                <SelectItem value="Frank Herbert">Frank Herbert</SelectItem>
                <SelectItem value="Isaac Asimov">Isaac Asimov</SelectItem>
                <SelectItem value="Aldous Huxley">Aldous Huxley</SelectItem>
                <SelectItem value="George Orwell">George Orwell</SelectItem>
                <SelectItem value="J.R.R. Tolkien">J.R.R. Tolkien</SelectItem>
                <SelectItem value="Harper Lee">Harper Lee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-1/3">
            <Label htmlFor="category-filter">Category</Label>
            <Select value={category} onValueChange={(value) => updateQueryParam('category', value)}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                <SelectItem value="Dystopian">Dystopian</SelectItem>
                <SelectItem value="Classic Literature">Classic Literature</SelectItem>
                <SelectItem value="Fantasy">Fantasy</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="w-full sm:w-1/3 flex items-end">
            <Button variant="outline" onClick={() => router.push('/search')} className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-headline">Results {query && `for "${query}"`}</h2>
        {filteredResults.length > 0 ? (
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
