
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, writeBatch, Timestamp, increment, setDoc, query, orderBy, limit, addDoc, updateDoc, deleteDoc, runTransaction, where, serverTimestamp } from 'firebase/firestore';
import initialBooksData from '@/data/books.json';


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
    createdAt: Timestamp;
    reviewCount?: number;
    averageRating?: number;
}

export interface ReviewData {
    userId: string;
    userName: string;
    userAvatar: string;
    rating: number;
    comment: string;
}

export interface BookRequest {
    id?: string;
    title: string;
    reason: string;
    userId: string;
    userName: string;
    createdAt: Timestamp;
    status: 'pending' | 'archived';
}

const booksCollection = collection(db, 'books');
const requestsCollection = collection(db, 'bookRequests');

// CREATE
export const addBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'availableCopies' | 'reviewCount' | 'averageRating'>): Promise<string> => {
    const newBookData = {
        ...bookData,
        availableCopies: bookData.totalCopies,
        createdAt: Timestamp.now(),
        reviewCount: 0,
        averageRating: 0,
    };
    const docRef = await addDoc(booksCollection, newBookData);
    // Now update the document with its own ID
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};

// READ ALL
export const getBooks = async (sortBy: string = 'createdAt', order: 'desc' | 'asc' = 'desc', count?: number): Promise<Book[]> => {
    let q;
    
    // Handle popularity sort (mock for now)
    if (sortBy === 'popularity') {
       q = query(booksCollection, orderBy('totalCopies', 'desc'));
    } else {
       q = query(booksCollection, orderBy(sortBy, order));
    }

    if (count) {
        q = query(q, limit(count));
    }

    const snapshot = await getDocs(q);
    
    // If the database is empty, seed it with initial data
    if (snapshot.empty && !count) { // Only seed if we are fetching all books and it's empty
        console.log("No books found in Firestore, seeding initial data...");
        await seedInitialBooks();
        // Fetch again after seeding
        const seededSnapshot = await getDocs(q);
        return seededSnapshot.docs.map(doc => doc.data() as Book);
    }

    return snapshot.docs.map(doc => doc.data() as Book);
};

// READ ONE
export const getBook = async (id: string): Promise<Book | null> => {
    // Firestore's getDoc requires the actual document ID, not a field value
    // If your `id` field is the same as the Firestore document ID, this is fine.
    // If not, you need to query.
    const docRef = doc(db, 'books', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as Book;
    } 

    // Fallback query if the id is a custom field and not the document ID
    const q = query(collection(db, "books"), where("id", "==", id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as Book;
    }
    
    return null;
};

// UPDATE
export const updateBook = async (id: string, data: Partial<Omit<Book, 'id' | 'availableCopies'>>) => {
    const bookRef = doc(db, "books", id);

    await runTransaction(db, async (transaction) => {
        const bookDoc = await transaction.get(bookRef);
        if (!bookDoc.exists()) {
            throw "Document does not exist!";
        }

        const oldTotal = bookDoc.data().totalCopies;
        const oldAvailable = bookDoc.data().availableCopies;
        const copyDiff = data.totalCopies !== undefined ? data.totalCopies - oldTotal : 0;
        const newAvailable = oldAvailable + copyDiff;

        if (newAvailable < 0) {
            throw new Error("Cannot reduce total copies below the number of borrowed books.");
        }
        
        const updateData: any = { ...data };
        if (copyDiff !== 0) {
             updateData.availableCopies = newAvailable;
        }

        transaction.update(bookRef, updateData);
    });
};


// DELETE
export const deleteBook = async (id: string) => {
    const bookRef = doc(db, "books", id);
    await deleteDoc(bookRef);
};


// Borrow a book
export const borrowBook = async (bookId: string, userId: string) => {
    const bookRef = doc(db, "books", bookId);
    const userRef = doc(db, "users", userId);

    await runTransaction(db, async (transaction) => {
        let bookDoc = await transaction.get(bookRef);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
            throw new Error("User not found.");
        }
        
        // If book doesn't exist in Firestore, create it from JSON data
        if (!bookDoc.exists()) {
            const bookDataFromJson = (initialBooksData as unknown as Book[]).find(b => b.id === bookId);
            if (!bookDataFromJson) {
                throw new Error("This book does not exist in the catalog.");
            }
            // Create a DB-ready version of the book
            const newBookForDB = {
                ...bookDataFromJson,
                createdAt: Timestamp.fromDate(new Date(bookDataFromJson.createdAt.seconds * 1000)),
                reviewCount: 0,
                averageRating: 0,
            };
            transaction.set(bookRef, newBookForDB);
            // Re-fetch the document within the transaction to work with it
            bookDoc = await transaction.get(bookRef); 
        }

        if (bookDoc.data()!.availableCopies < 1) {
            throw new Error("This book is currently unavailable.");
        }

        const borrowedBooks = userDoc.data().borrowedBooks || [];
        if (borrowedBooks.some((b: any) => b.bookId === bookId && b.status === 'borrowed')) {
            throw new Error("You have already borrowed this book.");
        }

        // Decrement available copies
        transaction.update(bookRef, { availableCopies: increment(-1) });

        // Add to user's borrowed books list
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 2-week borrowing period
        const newBorrowedList = [
            ...borrowedBooks,
            { bookId, borrowedDate: Timestamp.now(), dueDate: Timestamp.fromDate(dueDate), status: 'borrowed' }
        ];
        transaction.update(userRef, { borrowedBooks: newBorrowedList });
    });
};


// Return a book
export const returnBook = async (bookId: string, userId: string) => {
    const bookRef = doc(db, "books", bookId);
    const userRef = doc(db, "users", userId);
    
    await runTransaction(db, async (transaction) => {
        const bookDoc = await transaction.get(bookRef);
        const userDoc = await transaction.get(userRef);

        if (!bookDoc.exists()) {
            throw new Error("Book not found.");
        }
        if (!userDoc.exists()) {
            throw new Error("User not found.");
        }

        const borrowedBooks = userDoc.data().borrowedBooks || [];
        const bookToReturnIndex = borrowedBooks.findIndex((b: any) => b.bookId === bookId && b.status === 'borrowed');

        if (bookToReturnIndex === -1) {
            throw new Error("You have not borrowed this book or it has already been returned.");
        }

        // Increment available copies
        transaction.update(bookRef, { availableCopies: increment(1) });

        // Update the book's status in the user's list
        borrowedBooks[bookToReturnIndex].status = 'returned';
        borrowedBooks[bookToReturnIndex].returnedDate = Timestamp.now();
        transaction.update(userRef, { borrowedBooks });
    });
};

export const submitReview = async (bookId: string, review: ReviewData) => {
  const bookRef = doc(db, 'books', bookId);
  const reviewRef = doc(collection(bookRef, 'reviews'));

  await runTransaction(db, async (transaction) => {
    const bookDoc = await transaction.get(bookRef);
    if (!bookDoc.exists()) {
      throw new Error("Book not found.");
    }

    // Add the new review
    transaction.set(reviewRef, { ...review, createdAt: serverTimestamp() });

    // Update aggregate data on the book
    const newReviewCount = (bookDoc.data().reviewCount || 0) + 1;
    const oldRatingTotal = (bookDoc.data().averageRating || 0) * (bookDoc.data().reviewCount || 0);
    const newAverageRating = (oldRatingTotal + review.rating) / newReviewCount;

    transaction.update(bookRef, {
      reviewCount: increment(1),
      averageRating: newAverageRating,
    });
  });
};

export const getReviews = async (bookId: string) => {
  const reviewsCol = collection(db, 'books', bookId, 'reviews');
  const q = query(reviewsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Book Request Functions
export const createBookRequest = async (requestData: Omit<BookRequest, 'id' | 'createdAt' | 'status'>): Promise<string> => {
    const newRequestData = {
        ...requestData,
        createdAt: Timestamp.now(),
        status: 'pending' as const,
    };
    const docRef = await addDoc(requestsCollection, newRequestData);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};

export const getBookRequests = async (status: 'pending' | 'archived' = 'pending'): Promise<BookRequest[]> => {
    const q = query(requestsCollection, where('status', '==', status), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as BookRequest);
};

export const archiveBookRequest = async (id: string) => {
    const requestRef = doc(requestsCollection, id);
    await updateDoc(requestRef, { status: 'archived' });
};


// Helper to seed database from JSON
export const seedInitialBooks = async () => {
    const batch = writeBatch(db);
    initialBooksData.forEach((book) => {
        // Use the `id` from JSON as the document ID in Firestore
        const bookRef = doc(db, 'books', book.id);
        const createdAtTimestamp = book.createdAt ? new Timestamp(book.createdAt.seconds, book.createdAt.nanoseconds) : Timestamp.now();
        batch.set(bookRef, { ...book, createdAt: createdAtTimestamp, reviewCount: 0, averageRating: 0 });
    });

    try {
        await batch.commit();
        console.log("Initial books have been seeded successfully.");
    } catch (error) {
        console.error("Error seeding initial books: ", error);
    }
};
