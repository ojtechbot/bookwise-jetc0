
import { db } from '@/lib/firebase';
import { doc, getDoc, writeBatch, Timestamp, increment } from 'firebase/firestore';
import booksData from '@/data/books.json';


export interface Book {
    id: string;
    title: string;
    author: string;
    category: string;
    summary: string;
    authorInfo: string;
    publishedYear: number;
    totalCopies: number;
    availableCopies: number;
    coverUrl: string;
    hint?: string;
    createdAt?: { seconds: number; nanoseconds: number };
}

let books: Book[] = booksData as Book[];

// CREATE (Simulated)
export const addBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'availableCopies'>) => {
    const newBook: Book = {
        ...bookData,
        id: `new-${Math.random().toString(36).substr(2, 9)}`, // Generate a temporary ID
        availableCopies: bookData.totalCopies,
        createdAt: {
            seconds: Math.floor(Date.now() / 1000),
            nanoseconds: 0
        },
    };
    books.push(newBook);
    console.log("Simulated: Added book", newBook);
    return newBook.id;
};

// READ
export const getBooks = async (): Promise<Book[]> => {
    // Return a copy to prevent direct mutation of the in-memory array
    return JSON.parse(JSON.stringify(books));
};

// READ ONE
export const getBook = async (id: string): Promise<Book | null> => {
    const book = books.find(b => b.id === id);
    if (book) {
        // Return a copy
        return JSON.parse(JSON.stringify(book));
    }
    return null;
};

// UPDATE (Simulated)
export const updateBook = async (id: string, data: Partial<Omit<Book, 'id'>>) => {
    const bookIndex = books.findIndex(b => b.id === id);
    if (bookIndex === -1) {
        throw new Error("Book not found for update.");
    }
    const oldBook = books[bookIndex];

    // Recalculate available copies if total copies changes
    const oldTotal = oldBook.totalCopies;
    const oldAvailable = oldBook.availableCopies;
    const copyDiff = data.totalCopies !== undefined ? data.totalCopies - oldTotal : 0;
    const newAvailable = oldAvailable + copyDiff;
    
    if (newAvailable < 0) {
        throw new Error("Cannot reduce total copies below the number of borrowed books.");
    }

    const updateData: Partial<Book> = { ...data };
    if (copyDiff !== 0) {
        updateData.availableCopies = newAvailable;
    }
    
    books[bookIndex] = { ...oldBook, ...updateData };
    console.log("Simulated: Updated book", books[bookIndex]);
};


// DELETE (Simulated)
export const deleteBook = async (id: string) => {
    books = books.filter(b => b.id !== id);
    console.log("Simulated: Deleted book with id", id);
};

// Borrow a book (Simulated + Firestore for user data)
export const borrowBook = async (bookId: string, userId: string) => {
    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex === -1) {
        throw new Error("This book is currently unavailable.");
    }
    if (books[bookIndex].availableCopies < 1) {
        throw new Error("This book is currently unavailable.");
    }

    // Still need to interact with Firestore for user profile
    const userRef = doc(db, "users", userId);
    const batch = writeBatch(db);

    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        throw new Error("User not found.");
    }

    const borrowedBooks = userDoc.data().borrowedBooks || [];
    if (borrowedBooks.some((b: any) => b.bookId === bookId && b.status === 'borrowed')) {
        throw new Error("You have already borrowed this book.");
    }

    // Decrement available copies in memory
    books[bookIndex].availableCopies--;

    // Add to user's borrowed books list in Firestore
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2-week borrowing period
    const newBorrowedList = [
        ...borrowedBooks,
        { bookId, borrowedDate: Timestamp.now(), dueDate: Timestamp.fromDate(dueDate), status: 'borrowed' }
    ];
    batch.update(userRef, { borrowedBooks: newBorrowedList });

    await batch.commit();
    console.log(`Simulated: Borrowed book ${bookId} for user ${userId}. New available copies: ${books[bookIndex].availableCopies}`);
};


// Return a book (Simulated + Firestore for user data)
export const returnBook = async (bookId: string, userId: string) => {
    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex === -1) {
        throw new Error("Book not found.");
    }

    // Still need to interact with Firestore for user profile
    const userRef = doc(db, "users", userId);
    const batch = writeBatch(db);

    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        throw new Error("User not found.");
    }

    const borrowedBooks = userDoc.data().borrowedBooks || [];
    const bookToReturnIndex = borrowedBooks.findIndex((b: any) => b.bookId === bookId && b.status === 'borrowed');

    if (bookToReturnIndex === -1) {
        throw new Error("You have not borrowed this book or it has already been returned.");
    }

    // Increment available copies in memory
    books[bookIndex].availableCopies++;

    // Update the book's status in the user's list
    borrowedBooks[bookToReturnIndex].status = 'returned';
    borrowedBooks[bookToReturnIndex].returnedDate = Timestamp.now();
    batch.update(userRef, { borrowedBooks });

    await batch.commit();
    console.log(`Simulated: Returned book ${bookId} for user ${userId}. New available copies: ${books[bookIndex].availableCopies}`);
};
