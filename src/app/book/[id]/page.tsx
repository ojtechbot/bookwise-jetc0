
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, BookOpen, Lightbulb, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState, useTransition } from 'react';
import { summarizeBook } from '@/ai/flows/summarize-book-flow';

export default function BookDetailsPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch book data based on params.id
  const book = {
    id: params.id,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverUrl: 'https://placehold.co/400x600.png',
    summary: "The Great Gatsby, F. Scott Fitzgerald's third book, stands as the supreme achievement of his career. This exemplary novel of the Jazz Age has been acclaimed by generations of readers. The story of the fabulously wealthy Jay Gatsby and his new love for the beautiful Daisy Buchanan, of lavish parties on Long Island at a time when 'gin was the national drink and sex the national obsession,' it is an exquisitely crafted tale of America in the 1920s.",
    authorInfo: "Francis Scott Key Fitzgerald (September 24, 1896 – December 21, 1940) was an American novelist, essayist, short story writer, and screenwriter. He was best known for his novels depicting the flamboyance and excess of the Jazz Age—a term which he coined.",
    category: "Classic Literature",
    published: "1925",
  };

  const [isSummaryPending, startSummaryTransition] = useTransition();
  const [aiSummary, setAiSummary] = useState('');

  const handleGenerateSummary = () => {
    startSummaryTransition(async () => {
      try {
        const result = await summarizeBook({ title: book.title, author: book.author });
        setAiSummary(result.summary);
      } catch (error) {
        console.error("Failed to generate summary:", error);
        setAiSummary("Sorry, we couldn't generate a summary at this time.");
      }
    });
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="grid md:grid-cols-3 gap-8 md:gap-12">
        <div className="md:col-span-1">
          <Card className="overflow-hidden sticky top-24">
            <Image
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              width={400}
              height={600}
              className="w-full h-auto object-cover"
              data-ai-hint="classic novel"
            />
          </Card>
        </div>
        <div className="md:col-span-2">
          <Badge variant="secondary" className="mb-2">{book.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">{book.title}</h1>
          <p className="mt-2 text-xl text-muted-foreground">by {book.author}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="w-full sm:w-auto">
              <BookOpen className="mr-2 h-5 w-5" /> Read Online
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-5 w-5" /> Download eBook
            </Button>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-bold font-headline">Summary</h2>
            <p className="mt-4 text-lg leading-relaxed">{book.summary}</p>
          </div>
          <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="item-1">
              <AccordionTrigger onClick={() => !aiSummary && handleGenerateSummary()}>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  <span>AI-Powered TL;DR Summary</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed">
                {isSummaryPending ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating summary...</span>
                  </div>
                ) : (
                  aiSummary
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-bold font-headline">About the Author</h2>
            <p className="mt-4 text-lg leading-relaxed">{book.authorInfo}</p>
          </div>
           <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-bold font-headline">Details</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 text-lg">
                <div><span className="font-semibold">Published:</span> {book.published}</div>
                <div><span className="font-semibold">ID:</span> {book.id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
