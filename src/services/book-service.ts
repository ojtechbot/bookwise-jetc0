
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where, writeBatch, Timestamp } from 'firebase/firestore';

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
    createdAt?: Timestamp;
}

const booksCollection = collection(db, 'books');

// CREATE
export const addBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'availableCopies'>) => {
    const newBookData = {
        ...bookData,
        availableCopies: bookData.totalCopies, // Initially, all copies are available
        createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(booksCollection, newBookData);
    return docRef.id;
};

// READ
export const getBooks = async (): Promise<Book[]> => {
    const snapshot = await getDocs(booksCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
};

// READ ONE
export const getBook = async (id: string): Promise<Book | null> => {
    const docRef = doc(db, 'books', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Book;
    }
    return null;
};

// UPDATE
export const updateBook = async (id: string, data: Partial<Book>) => {
    const docRef = doc(db, 'books', id);
    await updateDoc(docRef, data);
};

// DELETE
export const deleteBook = async (id: string) => {
    const docRef = doc(db, 'books', id);
    await deleteDoc(docRef);
};

// Borrow a book
export const borrowBook = async (bookId: string, userId: string) => {
    const bookRef = doc(db, "books", bookId);
    const userRef = doc(db, "users", userId);
    const batch = writeBatch(db);

    const bookDoc = await getDoc(bookRef);
    if (!bookDoc.exists() || bookDoc.data().availableCopies < 1) {
        throw new Error("This book is currently unavailable.");
    }

    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        throw new Error("User not found.");
    }

    const borrowedBooks = userDoc.data().borrowedBooks || [];
    if (borrowedBooks.some((b: any) => b.bookId === bookId && b.status === 'borrowed')) {
        throw new Error("You have already borrowed this book.");
    }

    // Decrement available copies
    batch.update(bookRef, { availableCopies: bookDoc.data().availableCopies - 1 });

    // Add to user's borrowed books list
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2-week borrowing period
    const newBorrowedList = [
        ...borrowedBooks, 
        { bookId, borrowedDate: Timestamp.now(), dueDate: Timestamp.fromDate(dueDate), status: 'borrowed' }
    ];
    batch.update(userRef, { borrowedBooks: newBorrowedList });

    await batch.commit();
};


// Return a book
export const returnBook = async (bookId: string, userId: string) => {
    const bookRef = doc(db, "books", bookId);
    const userRef = doc(db, "users", userId);
    const batch = writeBatch(db);

    const bookDoc = await getDoc(bookRef);
    if (!bookDoc.exists()) {
        throw new Error("Book not found.");
    }

    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        throw new Error("User not found.");
    }
    
    const borrowedBooks = userDoc.data().borrowedBooks || [];
    const bookToReturnIndex = borrowedBooks.findIndex((b: any) => b.bookId === bookId && b.status === 'borrowed');

    if (bookToReturnIndex === -1) {
        throw new Error("You have not borrowed this book or it has already been returned.");
    }

    // Increment available copies
    batch.update(bookRef, { availableCopies: bookDoc.data().availableCopies + 1 });

    // Update the book's status in the user's list
    borrowedBooks[bookToReturnIndex].status = 'returned';
    borrowedBooks[bookToReturnIndex].returnedDate = Timestamp.now();
    batch.update(userRef, { borrowedBooks });

    await batch.commit();
};

