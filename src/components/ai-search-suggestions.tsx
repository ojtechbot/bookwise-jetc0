"use client";

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { suggestSearchTerms, type SuggestSearchTermsOutput } from '@/ai/flows/suggest-search-terms';

type AiSearchSuggestionsProps = {
  initialQuery?: string;
};

export default function AiSearchSuggestions({ initialQuery = '' }: AiSearchSuggestionsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', newQuery);
    router.push(`/search?${params.toString()}`);
  };

  const getSuggestions = useCallback((currentQuery: string) => {
    if (currentQuery.length > 2) {
      startTransition(async () => {
        try {
          const result: SuggestSearchTermsOutput = await suggestSearchTerms({ query: currentQuery });
          setSuggestions(result.suggestions || []);
        } catch (error) {
          console.error("Failed to get search suggestions:", error);
          setSuggestions([]);
        }
      });
    } else {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      getSuggestions(query);
    }, 500); // Debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [query, getSuggestions]);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(query);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onFormSubmit} className="flex items-center gap-2">
        <div className="relative w-full">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for books by title, author, or subject..."
            className="flex-grow text-base pr-10"
            aria-label="Search"
          />
          {isPending && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button type="submit" size="lg" aria-label="Search">
          <Search className="h-5 w-5" />
        </Button>
      </form>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium">Related:</span>
          {suggestions.map((suggestion, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                setQuery(suggestion);
                handleSearch(suggestion);
              }}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
