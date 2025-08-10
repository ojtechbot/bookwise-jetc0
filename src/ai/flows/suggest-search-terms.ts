'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting search terms related to a user's current query.
 *
 * - suggestSearchTerms - A function that takes a user's query and returns suggested search terms.
 * - SuggestSearchTermsInput - The input type for the suggestSearchTerms function.
 * - SuggestSearchTermsOutput - The return type for the suggestSearchTerms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSearchTermsInputSchema = z.object({
  query: z.string().describe('The user\u0027s current search query.'),
});
export type SuggestSearchTermsInput = z.infer<typeof SuggestSearchTermsInputSchema>;

const SuggestSearchTermsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested search terms related to the query.'),
});
export type SuggestSearchTermsOutput = z.infer<typeof SuggestSearchTermsOutputSchema>;

export async function suggestSearchTerms(input: SuggestSearchTermsInput): Promise<SuggestSearchTermsOutput> {
  return suggestSearchTermsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSearchTermsPrompt',
  input: {schema: SuggestSearchTermsInputSchema},
  output: {schema: SuggestSearchTermsOutputSchema},
  prompt: `You are a library assistant helping users find books.

  The user has entered the following search query: {{{query}}}

  Suggest some related search terms that might help them find what they are looking for. Return at least 3 suggestions.

  Ensure that the suggestions are relevant to books and literature.

  Format the suggestions as a JSON array of strings.`,
});

const suggestSearchTermsFlow = ai.defineFlow(
  {
    name: 'suggestSearchTermsFlow',
    inputSchema: SuggestSearchTermsInputSchema,
    outputSchema: SuggestSearchTermsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
