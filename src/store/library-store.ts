
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LibraryState {
  borrowedBooks: string[]; // array of book IDs
  returnedBooks: string[]; // array of book IDs
  borrowBook: (bookId: string) => void;
  returnBook: (bookId: string) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      borrowedBooks: [],
      returnedBooks: [],
      borrowBook: (bookId) =>
        set((state) => ({
          borrowedBooks: [...state.borrowedBooks, bookId],
          returnedBooks: state.returnedBooks.filter((id) => id !== bookId),
        })),
      returnBook: (bookId) =>
        set((state) => ({
          borrowedBooks: state.borrowedBooks.filter((id) => id !== bookId),
          returnedBooks: [...state.returnedBooks, bookId],
        })),
    }),
    {
      name: 'library-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);
