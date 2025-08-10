'use server';

/**
 * @fileOverview A Genkit flow for handling student book requests.
 *
 * - requestBook - A function that takes a book title and reason, and simulates a request.
 * - RequestBookInput - The input type for the requestBook function.
 * - RequestBookOutput - The return type for the requestBook function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RequestBookInputSchema = z.object({
  title: z.string().describe('The title of the book being requested.'),
  reason: z.string().describe('The reason why the student is requesting this book.'),
});
export type RequestBookInput = z.infer<typeof RequestBookInputSchema>;

const RequestBookOutputSchema = z.object({
  success: z.boolean().describe('Whether the book request was successfully submitted.'),
  message: z.string().describe('A message confirming the status of the request.'),
});
export type RequestBookOutput = z.infer<typeof RequestBookOutputSchema>;

export async function requestBook(input: RequestBookInput): Promise<RequestBookOutput> {
  return requestBookFlow(input);
}

const requestBookFlow = ai.defineFlow(
  {
    name: 'requestBookFlow',
    inputSchema: RequestBookInputSchema,
    outputSchema: RequestBookOutputSchema,
  },
  async (input) => {
    console.log(`Book request received for "${input.title}". Reason: ${input.reason}`);
    // In a real application, you would save this request to a database.
    // For this example, we'll just simulate a successful submission.
    return {
      success: true,
      message: `Your request for "${input.title}" has been submitted successfully. You will be notified when it is available.`,
    };
  }
);
