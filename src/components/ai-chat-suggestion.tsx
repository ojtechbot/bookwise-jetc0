
'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/chat-store';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const suggestionMessages = [
  "Hi! Do you need any assistance?",
  "Ask me anything about the library!",
  "Feeling stuck? Let me help you find a book.",
  "Hello! I can help with recommendations, just ask.",
  "What are you looking for today?",
  "Your friendly AI assistant, ready to help!",
];

export function AiChatSuggestion() {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const { setNotification, isOpen } = useChatStore();

  // Effect to trigger the suggestion pop-up
  useEffect(() => {
    if (isOpen) {
      setIsVisible(false);
      return;
    }
    
    // Check if a suggestion has been shown in this session
    if (sessionStorage.getItem('chatSuggestionShown')) {
        return;
    }

    const timer = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * suggestionMessages.length);
      setMessage(suggestionMessages[randomIndex]);
      setIsVisible(true);
      setNotification(true);
      sessionStorage.setItem('chatSuggestionShown', 'true');
    }, 5000); // Show after 5 seconds

    return () => clearTimeout(timer);
  }, [setNotification, isOpen]);

  // Effect to auto-hide the pop-up
  useEffect(() => {
    if (isVisible) {
      const hideTimer = setTimeout(() => {
        handleClose();
      }, 8000); // Hide after 8 seconds

      return () => clearTimeout(hideTimer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-24 right-6 z-50 w-64 p-4 rounded-lg shadow-lg bg-card text-card-foreground transition-all duration-500 animate-in fade-in slide-in-from-bottom-5',
        'md:right-24'
      )}
    >
      <button
        onClick={handleClose}
        className="absolute top-1 right-1 p-1 text-muted-foreground hover:text-foreground"
        aria-label="Close suggestion"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="text-sm">{message}</p>
      <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[10px] border-l-transparent border-t-[15px] border-t-card border-r-[10px] border-r-transparent"></div>
    </div>
  );
}
