
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Menu, PlusSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatbot } from '@/ai/flows/chatbot-flow';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '@/context/auth-context';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Separator } from './ui/separator';

type Message = {
  role: 'user' | 'bot';
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};

const initialMessage: Message = {
    role: 'bot',
    content: `Hello! I'm your friendly AI assistant. You can ask me about the Libroweb app, get book recommendations, or even ask for study tips. How can I help you today?`,
};

export function AiChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load conversations from local storage on mount
  useEffect(() => {
    if(typeof window !== 'undefined') {
        const savedConversations = localStorage.getItem('chatConversations');
        if (savedConversations) {
            setConversations(JSON.parse(savedConversations));
        }
    }
  }, []);

  // Save conversations to local storage whenever they change
  useEffect(() => {
    if(typeof window !== 'undefined') {
        localStorage.setItem('chatConversations', JSON.stringify(conversations));
    }
  }, [conversations]);
  
  const handleNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    const newConversation: Conversation = {
        id: newId,
        title: 'New Chat',
        messages: [initialMessage],
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newId);
    setInput('');
    setIsMenuOpen(false);
  };
  
  const selectConversation = (id: string) => {
    setCurrentConversationId(id);
    setIsMenuOpen(false);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
        // If the deleted chat was the current one, select the first available or create a new one
        const remainingConversations = conversations.filter(c => c.id !== id);
        if(remainingConversations.length > 1) { // 1 because state update is pending
             setCurrentConversationId(remainingConversations[1].id);
        } else {
            handleNewConversation();
        }
    }
  }


  useEffect(() => {
    if (isOpen && !currentConversationId) {
        // If there are no conversations, create a new one. Otherwise, select the most recent one.
        if (conversations.length === 0) {
            handleNewConversation();
        } else {
            setCurrentConversationId(conversations[0].id);
        }
    }
  }, [isOpen, currentConversationId, conversations]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [conversations, currentConversationId]);

  const handleSendMessage = () => {
    if (input.trim() === '' || !currentConversationId) return;

    const userMessage: Message = { role: 'user', content: input };
    
    // Create a new conversation if the title is still 'New Chat'
    const currentConversation = conversations.find(c => c.id === currentConversationId);
    const newTitle = currentConversation?.title === 'New Chat' ? input.trim().substring(0, 30) + '...' : currentConversation?.title;

    const updatedConversations = conversations.map(c => 
        c.id === currentConversationId 
        ? { ...c, title: newTitle, messages: [...c.messages, userMessage] } 
        : c
    );
    setConversations(updatedConversations);
    
    const history = updatedConversations.find(c => c.id === currentConversationId)?.messages.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content
    })) || [];
    
    setInput('');

    startTransition(async () => {
      try {
        const response = await chatbot({ 
            query: input, 
            history,
            userName: user?.displayName || 'Guest'
        });
        const botMessage: Message = { role: 'bot', content: response.reply };
        setConversations(prev => prev.map(c => 
            c.id === currentConversationId 
            ? { ...c, messages: [...c.messages, botMessage] } 
            : c
        ));
      } catch (error) {
        console.error('Chatbot error:', error);
        const errorMessage: Message = {
          role: 'bot',
          content: 'Sorry, I encountered an error. Please try again.',
        };
        setConversations(prev => prev.map(c => 
            c.id === currentConversationId 
            ? { ...c, messages: [...c.messages, errorMessage] } 
            : c
        ));
      }
    });
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  }

  const currentMessages = conversations.find(c => c.id === currentConversationId)?.messages || [];

  return (
    <>
      <div className={cn("fixed bottom-6 right-6 z-50 transition-transform duration-300", isOpen ? 'translate-x-[200%]' : 'translate-x-0')}>
        <Button onClick={() => setIsOpen(true)} size="icon" className="rounded-full w-16 h-16 shadow-lg">
          <MessageSquare className="h-8 w-8" />
        </Button>
      </div>

      <div className={cn("fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-md transition-all duration-300", isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none')}>
        <Card className="flex flex-col h-[70vh] max-h-[70vh] shadow-2xl relative overflow-hidden">
            {/* History Sidebar */}
            <div className={cn("absolute top-0 left-0 h-full w-4/5 bg-background border-r z-20 transition-transform duration-300 ease-in-out", isMenuOpen ? 'translate-x-0' : '-translate-x-full')}>
                 <CardHeader>
                     <CardTitle>Chat History</CardTitle>
                 </CardHeader>
                 <ScrollArea className="flex-grow h-[calc(100%-120px)]">
                    <div className="p-2 space-y-2">
                        {conversations.map(conv => (
                             <div key={conv.id} className="group flex items-center">
                                <Button
                                    variant={currentConversationId === conv.id ? 'secondary' : 'ghost'}
                                    className="w-full justify-start truncate"
                                    onClick={() => selectConversation(conv.id)}
                                >
                                    {conv.title}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                    onClick={() => deleteConversation(conv.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                 </ScrollArea>
                 <CardFooter className='absolute bottom-0 w-full'>
                     <Button onClick={handleNewConversation} className="w-full">
                         <PlusSquare className="mr-2 h-4 w-4" /> New Chat
                     </Button>
                 </CardFooter>
            </div>


            {/* Main Chat View */}
           <div className={cn("flex flex-col h-full transition-transform duration-300 ease-in-out", isMenuOpen ? 'translate-x-[80%]' : 'translate-x-0')}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <Sparkles className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline">AI Study Buddy</CardTitle>
                </div>
                 <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handleNewConversation}>
                        <PlusSquare className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                 </div>
              </CardHeader>
              <ScrollArea className="flex-grow" ref={scrollAreaRef}>
                <CardContent className="space-y-4 p-4">
                  {currentMessages.map((message, index) => (
                    <div key={index} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                      {message.role === 'bot' && (
                         <Avatar className="w-8 h-8 border-2 border-primary/20">
                            <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                      )}
                       <div className={cn('p-3 rounded-lg max-w-xs md:max-w-sm prose prose-sm dark:prose-invert', 
                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
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
           </div>
        </Card>
      </div>
    </>
  );
}
