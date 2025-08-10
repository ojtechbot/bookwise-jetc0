
'use server';

/**
 * @fileOverview A friendly AI chatbot for the Libroweb application.
 *
 * - chatbot - The main function that handles chat interactions.
 * - ChatbotInput - The input type for the chatbot function.
 * - ChatbotOutput - The return type for the chatbot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'bot']),
  content: z.string(),
});

const ChatbotInputSchema = z.object({
  query: z.string().describe("The user's latest message."),
  history: z.array(MessageSchema).describe('The conversation history.'),
  userName: z.string().describe("The user's name."),
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
  input: { schema: ChatbotInputSchema },
  output: { schema: ChatbotOutputSchema },
  prompt: `You are a friendly, helpful, and slightly enthusiastic AI assistant for a digital library application called "Libroweb". Your name is "Study Buddy". 

You are chatting with {{userName}}.

Your capabilities are:
1.  **Answer questions about Libroweb**: Explain its features like borrowing, returning, searching for books, and the student/admin dashboards.
2.  **Provide Book Recommendations**: If a user asks for a book on a topic, suggest one or two. You don't have access to the full library catalog, so make up plausible book titles and authors. Do not say you don't have access to the catalog.
3.  **Act as a Study Guide**: Provide general study tips, help with brainstorming ideas for essays, explain concepts in simple terms, or offer encouragement.
4.  **Engage in Friendly Conversation**: Be personable and engaging.

**Conversation History:**
{{#each history}}
- {{role}}: {{content}}
{{/each}}

**User's latest message:**
{{query}}

Based on the conversation history and the latest message, provide a helpful and friendly response. Address the user by their name, {{userName}}, when it feels natural. Keep your responses concise and easy to read. Use markdown for formatting if it helps readability (e.g., lists).
`,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
