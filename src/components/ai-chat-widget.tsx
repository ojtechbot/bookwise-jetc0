
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatbot } from '@/ai/flows/chatbot-flow';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '@/context/auth-context';

type Message = {
  role: 'user' | 'bot';
  content: string;
};

export function AiChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const initialMessage = {
    role: 'bot',
    content: `Hello! I'm your friendly AI assistant. You can ask me about the Libroweb app, get book recommendations, or even ask for study tips. How can I help you today?`,
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([initialMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    
    const history = messages.map(m => ({
        role: m.role,
        content: m.content
    }));

    startTransition(async () => {
      try {
        const response = await chatbot({ 
            query: input, 
            history,
            userName: user?.displayName || 'Guest'
        });
        const botMessage: Message = { role: 'bot', content: response.reply };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error('Chatbot error:', error);
        const errorMessage: Message = {
          role: 'bot',
          content: 'Sorry, I encountered an error. Please try again.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    });
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  }

  return (
    <>
      <div className={cn("fixed bottom-6 right-6 z-50 transition-transform duration-300", isOpen ? 'translate-x-[200%]' : 'translate-x-0')}>
        <Button onClick={() => setIsOpen(true)} size="icon" className="rounded-full w-16 h-16 shadow-lg">
          <MessageSquare className="h-8 w-8" />
        </Button>
      </div>

      <div className={cn("fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-md transition-all duration-300", isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none')}>
        <Card className="flex flex-col h-[70vh] max-h-[70vh] shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline">AI Study Buddy</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <ScrollArea className="flex-grow" ref={scrollAreaRef}>
            <CardContent className="space-y-4 p-4">
              {messages.map((message, index) => (
                <div key={index} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {message.role === 'bot' && (
                     <Avatar className="w-8 h-8 border-2 border-primary/20">
                        <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                  )}
                   <div className={cn('p-3 rounded-lg max-w-xs md:max-w-sm', 
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                   </div>
                  {message.role === 'user' && (
                     <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.photoURL ?? undefined} />
                        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isPending && (
                 <div className="flex items-start gap-3 justify-start">
                     <Avatar className="w-8 h-8 border-2 border-primary/20">
                        <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                    </div>
                </div>
              )}
            </CardContent>
          </ScrollArea>
          <CardFooter className="pt-4 border-t">
            <form onSubmit={handleFormSubmit} className="flex w-full items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1"
                disabled={isPending}
              />
              <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
