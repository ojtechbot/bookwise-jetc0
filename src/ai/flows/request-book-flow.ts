'use server';

/**
 * @fileOverview A Genkit flow for handling student book requests.
 *
 * - requestBook - A function that takes a book title and reason, and saves the request.
 * - RequestBookInput - The input type for the requestBook function.
 * - RequestBookOutput - The return type for the requestBook function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { createBookRequest } from '@/services/book-service';

const RequestBookInputSchema = z.object({
  title: z.string().describe('The title of the book being requested.'),
  reason: z.string().describe('The reason why the student is requesting this book.'),
  userId: z.string().describe("The ID of the user making the request."),
  userName: z.string().describe("The name of the user making the request."),
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
    try {
        await createBookRequest({
            title: input.title,
            reason: input.reason,
            userId: input.userId,
            userName: input.userName,
        });
        return {
          success: true,
          message: `Your request for "${input.title}" has been submitted successfully.`,
        };
    } catch (error) {
        console.error('Failed to create book request:', error);
        return {
            success: false,
            message: 'There was an error submitting your request. Please try again later.'
        }
    }
  }
);
