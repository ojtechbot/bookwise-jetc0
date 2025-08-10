
'use server';

/**
 * @fileOverview A Genkit flow for recommending books to a user based on their borrowing history.
 *
 * - recommendBooks - A function that takes a user's borrowing history and returns book recommendations.
 * - RecommendBooksInput - The input type for the recommendBooks function.
 * - RecommendBooksOutput - The return type for the recommendBooks function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BookHistoryItemSchema = z.object({
  title: z.string(),
  author: z.string(),
  category: z.string(),
});

const RecommendBooksInputSchema = z.object({
  history: z.array(BookHistoryItemSchema).describe('The user\'s borrowing history.'),
  allBooks: z.array(BookHistoryItemSchema).describe('A list of all available books to recommend from.'),
});
export type RecommendBooksInput = z.infer<typeof RecommendBooksInputSchema>;

const RecommendBooksOutputSchema = z.object({
  recommendations: z.array(z.object({
      title: z.string(),
      author: z.string(),
      reason: z.string().describe("A short reason why this book is recommended."),
  })).describe('An array of recommended books.'),
});
export type RecommendBooksOutput = z.infer<typeof RecommendBooksOutputSchema>;


export async function recommendBooks(input: RecommendBooksInput): Promise<RecommendBooksOutput> {
  return recommendBooksFlow(input);
}


const prompt = ai.definePrompt({
    name: 'recommendBooksPrompt',
    input: { schema: RecommendBooksInputSchema },
    output: { schema: RecommendBooksOutputSchema },
    prompt: `You are a helpful library assistant that recommends books to users.

Based on the user's borrowing history, recommend up to 4 books from the list of all available books.
Do not recommend books that are already in the user's history.
Provide a short, compelling reason for each recommendation.

User's Borrowing History:
{{#each history}}
- {{title}} by {{author}} ({{category}})
{{/each}}

All Available Books:
{{#each allBooks}}
- {{title}} by {{author}} ({{category}})
{{/each}}
`,
});


const recommendBooksFlow = ai.defineFlow(
  {
    name: 'recommendBooksFlow',
    inputSchema: RecommendBooksInputSchema,
    outputSchema: RecommendBooksOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
