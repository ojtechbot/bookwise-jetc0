'use server';

/**
 * @fileOverview An advanced search agent for the library.
 *
 * - searchBooks - The main function that handles natural language search queries.
 * - SearchBooksInput - The input type for the searchBooks function.
 * - SearchBooksOutput - The return type for the searchBooks function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SearchBooksInputSchema = z.object({
  query: z.string().describe('The user\'s natural language search query.'),
});
export type SearchBooksInput = z.infer<typeof SearchBooksInputSchema>;

const SearchBooksOutputSchema = z.object({
  query: z.string().optional().describe('The refined keyword search query.'),
  category: z.string().optional().describe('The category to filter by.'),
  author: z.string().optional().describe('The author to filter by.'),
  publicationYear: z.number().optional().describe('The publication year to filter by.'),
  reasoning: z.string().describe('A brief explanation of why these filters were chosen.'),
});
export type SearchBooksOutput = z.infer<typeof SearchBooksOutputSchema>;

// Mock database of known authors and categories
const KNOWN_AUTHORS = ['Frank Herbert', 'Isaac Asimov', 'Aldous Huxley', 'George Orwell', 'J.R.R. Tolkien', 'Harper Lee'];
const KNOWN_CATEGORIES = ['Fiction', 'Sci-Fi', 'Classic Literature', 'Fantasy', 'Dystopian'];

const filterByCategory = ai.defineTool(
  {
    name: 'filterByCategory',
    description: 'Use this tool to filter search results by a specific category or genre.',
    inputSchema: z.object({
      category: z.string().describe(`The category to filter by. Must be one of: ${KNOWN_CATEGORIES.join(', ')}`),
    }),
    outputSchema: z.void(),
  },
  async () => {} // This is a pass-through tool, the LLM uses it for structured output.
);

const filterByAuthor = ai.defineTool(
  {
    name: 'filterByAuthor',
    description: 'Use this tool to filter search results by a specific author.',
    inputSchema: z.object({
      author: z.string().describe(`The author's full name. Try to match one of: ${KNOWN_AUTHORS.join(', ')}`),
    }),
    outputSchema: z.void(),
  },
  async () => {}
);

const filterByPublicationYear = ai.defineTool(
  {
    name: 'filterByPublicationYear',
    description: 'Use this tool to filter search results by publication year.',
    inputSchema: z.object({
      year: z.number().describe('The four-digit publication year.'),
    }),
    outputSchema: z.void(),
  },
  async () => {}
);


export async function searchBooks(input: SearchBooksInput): Promise<SearchBooksOutput> {
  return searchBooksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchAgentPrompt',
  tools: [filterByCategory, filterByAuthor, filterByPublicationYear],
  prompt: `You are an intelligent library search assistant. Your job is to take a user's natural language query and convert it into a structured search request using the available tools.

Analyze the user's query: "{{{query}}}"

First, extract the main keywords from the query that should be used for a text search.
Then, determine if the user is asking for a specific category, author, or publication year and use the corresponding tools to set those filters. If a specific author or category is mentioned, try to match it to the known values.
Finally, provide a brief, one-sentence explanation of your reasoning for the chosen filters.
`,
});

const searchBooksFlow = ai.defineFlow(
  {
    name: 'searchBooksFlow',
    inputSchema: SearchBooksInputSchema,
    outputSchema: SearchBooksOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    const toolCalls = llmResponse.toolCalls();

    const output: SearchBooksOutput = {
      reasoning: llmResponse.text || "Searching based on your query.",
      query: llmResponse.text.split('Keywords:')[1]?.split(';')[0].trim().replace(/"/g, ''),
    };
    
    for (const toolCall of toolCalls) {
      if (toolCall.tool === 'filterByCategory') {
        output.category = toolCall.input.category;
      }
      if (toolCall.tool === 'filterByAuthor') {
        output.author = toolCall.input.author;
      }
      if (toolCall.tool === 'filterByPublicationYear') {
        output.publicationYear = toolCall.input.year;
      }
    }
    
    // Extract reasoning, which is the text part of the response.
    output.reasoning = llmResponse.text;

    // A simple heuristic to extract keywords if they are not part of the reasoning.
    if (!output.query && input.query) {
        // Remove tool-related phrases
        const queryKeywords = input.query
            .replace(/category|genre|author|by|year|in|from/gi, '')
            .replace(/\b(a|an|the|is|are)\b/gi, '')
            .trim();
        output.query = queryKeywords;
    }


    return output;
  }
);
