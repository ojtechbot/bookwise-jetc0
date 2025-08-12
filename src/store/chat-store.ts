
import { create } from 'zustand';

interface ChatState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  showNotification: boolean;
  setNotification: (show: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  showNotification: false,
  setNotification: (show) => set({ showNotification: show }),
}));
