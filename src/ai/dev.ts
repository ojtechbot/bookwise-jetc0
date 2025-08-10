
'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-search-terms.ts';
import '@/ai/flows/generate-avatar-flow.ts';
import '@/ai/flows/request-book-flow.ts';
import '@/ai/flows/summarize-book-flow.ts';
import '@/ai/flows/search-books-flow.ts';
import '@/ai/flows/recommend-books-flow.ts';
import '@/ai/flows/chatbot-flow.ts';
