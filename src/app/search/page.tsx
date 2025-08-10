import { BookCard } from "@/components/book-card";
import AiSearchSuggestions from "@/components/ai-search-suggestions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const searchResults = [
  { id: '1', title: 'Dune', author: 'Frank Herbert', coverUrl: 'https://placehold.co/300x450.png', hint: 'desert planet' },
  { id: '2', title: 'Foundation', author: 'Isaac Asimov', coverUrl: 'https://placehold.co/300x450.png', hint: 'galaxy empire' },
  { id: '3', title: 'Brave New World', author: 'Aldous Huxley', coverUrl: 'https://placehold.co/300x450.png', hint: 'future society' },
  { id: '4', title: '1984', author: 'George Orwell', coverUrl: 'https://placehold.co/300x450.png', hint: 'dystopian future' },
  { id: '5', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', coverUrl: 'https://placehold.co/300x450.png', hint: 'fantasy map' },
  { id: '6', title: 'To Kill a Mockingbird', author: 'Harper Lee', coverUrl: 'https://placehold.co/300x450.png', hint: 'courtroom novel' },
];

export default function SearchPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const query = typeof searchParams?.q === 'string' ? searchParams.q : '';

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline text-primary">Search the Library</h1>
        <p className="text-lg text-muted-foreground">Find your next great read.</p>
      </header>
      
      <div className="mb-8 space-y-4">
        <AiSearchSuggestions initialQuery={query} />
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/3">
            <Label htmlFor="author-filter">Author</Label>
            <Select>
              <SelectTrigger id="author-filter">
                <SelectValue placeholder="Filter by author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="herbert">Frank Herbert</SelectItem>
                <SelectItem value="asimov">Isaac Asimov</SelectItem>
                <SelectItem value="huxley">Aldous Huxley</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-1/3">
            <Label htmlFor="subject-filter">Subject</Label>
            <Select>
              <SelectTrigger id="subject-filter">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scifi">Science Fiction</SelectItem>
                <SelectItem value="classic">Classic Literature</SelectItem>
                <SelectItem value="fantasy">Fantasy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-headline">Results {query && `for "${query}"`}</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {searchResults.map(book => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      </div>
    </div>
  );
}
