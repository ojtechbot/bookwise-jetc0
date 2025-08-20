
'use server';

/**
 * @fileOverview A friendly AI chatbot for the Foundation Polytechnic application.
 *
 * - chatbot - The main function that handles chat interactions.
 * - ChatbotInput - The input type for the chatbot function.
 * - ChatbotOutput - The return type for the chatbot function.
 */

import { ai } from '@/ai/genkit';
import { z, GenkitError } from 'genkit';
import { getBooks, Book } from '@/services/book-service';
import { getUsers, UserProfile } from '@/services/user-service';

// Tool to search the library
const searchLibrary = ai.defineTool(
  {
    name: 'searchLibrary',
    description: 'Search for books in the library catalog by title, author, or category.',
    inputSchema: z.object({
      query: z.string().describe('The search query for the book.'),
    }),
    outputSchema: z.array(z.object({
        title: z.string(),
        author: z.string(),
        category: z.string(),
        availableCopies: z.number(),
    })),
  },
  async ({ query }) => {
    const allBooks = await getBooks();
    const queryLower = query.toLowerCase();
    return allBooks
      .filter(book => 
        book.title.toLowerCase().includes(queryLower) ||
        book.author.toLowerCase().includes(queryLower) ||
        book.category.toLowerCase().includes(queryLower)
      )
      .map(({ title, author, category, availableCopies }) => ({ title, author, category, availableCopies }));
  }
);


// Tool to list all users (for admins)
const listAllUsers = ai.defineTool(
    {
        name: 'listAllUsers',
        description: 'Get a list of all registered users in the system. Requires admin privileges.',
        inputSchema: z.object({}),
        outputSchema: z.array(z.object({
            name: z.string(),
            email: z.string(),
            role: z.string(),
        }))
    },
    async () => {
        const allUsers = await getUsers();
        return allUsers.map(({ name, email, role }) => ({ name, email, role }));
    }
);


const MessageSchema = z.object({
  role: z.enum(['user', 'model', 'tool']),
  content: z.string(),
});

const ChatbotInputSchema = z.object({
  query: z.string().describe("The user's latest message."),
  history: z.array(MessageSchema).describe('The conversation history.'),
  userName: z.string().describe("The user's name."),
  isAdmin: z.boolean().describe("Whether the current user is an admin."),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  reply: z.string().describe('The AI assistant\'s response.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function chatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  tools: [searchLibrary, listAllUsers],
  input: { schema: ChatbotInputSchema },
  output: { schema: ChatbotOutputSchema },
  prompt: `You are a friendly, helpful, and slightly enthusiastic AI assistant for a digital library application for "Foundation Polytechnic". Your name is "Study Buddy". 

You are chatting with {{userName}}.

Your capabilities are:
1.  **Answer questions about the app**: Explain its features like borrowing, returning, searching for books, the student/admin dashboards, AI-powered book summaries, AI search suggestions, book reviews, and AI avatar generation.
2.  **Provide Book Recommendations & Search**: Use the \`searchLibrary\` tool to find specific books or provide recommendations from the catalog. When presenting search results, format them in a markdown table.
3.  **Guide Users**: If the user is a guest (userName is "Guest") and asks how to sign up or log in, provide them with helpful instructions and include markdown links to the pages. For example: [Click here to Register](/register) or [Click here to Login](/login).
4.  **Act as a Study Guide**: Provide general study tips, help with brainstorming ideas for essays, explain concepts in simple terms, or offer encouragement.
5.  **Write Code**: You can generate code snippets, especially in languages like Javascript, Python, and HTML. When writing code, always use markdown code blocks with the correct language identifier (e.g., \`\`\`html).
6.  **Admin Tasks**: If the user is an admin ({{isAdmin}} is true), you can use the \`listAllUsers\` tool to provide information about registered users. If a non-admin user asks for this information, you MUST refuse politely and explain it's an admin-only feature. When presenting user lists, format them in a markdown table.
7.  **Engage in Friendly Conversation**: Be personable and engaging.

**Conversation History:**
{{#each history}}
- {{role}}: {{content}}
{{/each}}

**User's latest message:**
{{query}}

Based on the conversation history and the latest message, provide a helpful and friendly response. Address the user by their name, {{userName}}, when it feels natural. Keep your responses concise and easy to read. Use markdown for formatting if it helps readability (e.g., lists, tables, code blocks).
`,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input) => {
    try {
      const llmResponse = await prompt(input);
      const output = llmResponse.output;

      if (output) {
        return output;
      }
      
      // Handle cases where the model uses a tool but doesn't provide text
      if (llmResponse.toolCalls().length > 0) {
        return { reply: "I've looked that up for you. Here are the results:" };
      }
      
      // Fallback for other unexpected cases
      return { reply: "I'm sorry, I'm not sure how to respond to that. Could you try rephrasing?" };

    } catch (e: any) {
        // Log the detailed error and return a user-friendly message
        console.error(`[Chatbot Flow Error]`, e);
        
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (e instanceof GenkitError) {
           errorMessage = `I'm sorry, I encountered a system error. Details: ${e.message}`;
        }
        
        return {
          reply: errorMessage
        };
    }
  }
);
