'use server';

/**
 * @fileOverview A Genkit flow for generating a TL;DR summary of a book.
 *
 * - summarizeBook - A function that takes a book title and author and returns a summary.
 * - SummarizeBookInput - The input type for the summarizeBook function.
 * - SummarizeBookOutput - The return type for the summarizeBook function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeBookInputSchema = z.object({
  title: z.string().describe('The title of the book.'),
  author: z.string().describe('The author of the book.'),
});
export type SummarizeBookInput = z.infer<typeof SummarizeBookInputSchema>;

const SummarizeBookOutputSchema = z.object({
  summary: z.string().describe('A short, "TL;DR" style summary of the book.'),
});
export type SummarizeBookOutput = z.infer<typeof SummarizeBookOutputSchema>;

export async function summarizeBook(input: SummarizeBookInput): Promise<SummarizeBookOutput> {
  return summarizeBookFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeBookPrompt',
  input: { schema: SummarizeBookInputSchema },
  output: { schema: SummarizeBookOutputSchema },
  prompt: `You are a helpful library assistant. A user wants a quick summary of a book.

Book Title: {{{title}}}
Author: {{{author}}}

Please provide a concise, "too-long; didn't-read" (TL;DR) style summary of this book. The summary should be one or two paragraphs at most and capture the main plot points and themes.`,
});

const summarizeBookFlow = ai.defineFlow(
  {
    name: 'summarizeBookFlow',
    inputSchema: SummarizeBookInputSchema,
    outputSchema: SummarizeBookOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
