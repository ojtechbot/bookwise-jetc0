
'use client';

import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, Timestamp, getDocs, serverTimestamp, writeBatch, query, where } from 'firebase/firestore';
import defaultStaff from '@/data/staff.json';
import { type Book, getBook } from './book-service';


// This is a client-side only function as it requires client-side Firebase SDKs
// It dynamically imports admin-only functions to avoid bundling them in the client
const ensureDefaultUsersOnClient = async () => {
    const { getAuth: getClientAuth, signInWithEmailAndPassword: clientSignIn, createUserWithEmailAndPassword: clientCreateUser, updateProfile: clientUpdateProfile, signOut: clientSignOut } = await import('firebase/auth');
    const { auth } = await import('@/lib/firebase');
    
    // Check if a flag is set in sessionStorage to prevent running this on every login attempt in a session
    if (sessionStorage.getItem('default_users_ensured')) {
        return;
    }

    console.log('Ensuring default staff users exist...');

    for (const user of defaultStaff) {
        const userRef = doc(db, 'users', user.email); // Using email as a temporary stable ID for check
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.log(`Default user ${user.email} not found in Firestore. Attempting to create...`);
            // This is a simplified creation process that happens on the client.
            // It's not as secure as a server-side seed script but works for this setup.
            try {
                // We need a temporary authenticated user to perform these actions if rules are strict
                // This is a known limitation. For this app, we assume rules allow this initial write or it fails gracefully.
                
                // Create the auth user. This part is tricky on the client if you're already logged in.
                // A true seed script is always better. This is a fallback.
                const tempAuth = getClientAuth();
                
                try {
                    // Try to log in to see if the auth user exists
                    await clientSignIn(tempAuth, user.email, user.password);
                    clientSignOut(tempAuth); // Sign out immediately
                } catch (error: any) {
                    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                         console.log(`Auth user for ${user.email} not found. Creating...`);
                         const userCred = await clientCreateUser(tempAuth, user.email, user.password);
                         await clientUpdateProfile(userCred.user, { displayName: user.name });

                         // Now create the Firestore document with the real UID
                         const userProfileData: UserProfile = {
                            uid: userCred.user.uid,
                            name: user.name,
                            email: user.email,
                            role: user.name.toLowerCase() as UserRole,
                            regNumber: null,
                            createdAt: Timestamp.now(),
                         };
                         await setDoc(doc(db, 'users', userCred.user.uid), userProfileData);

                         // Set the temporary doc so we don't try again
                         await setDoc(userRef, { created: true });
                         
                         await clientSignOut(userCred.user.auth);
                    } else {
                       throw error; // Re-throw other errors
                    }
                }
            } catch (error) {
                console.error(`Failed to create default user ${user.email}:`, error);
            }
        }
    }
     sessionStorage.setItem('default_users_ensured', 'true');
     console.log('Finished checking for default users.');
}


export type UserRole = 'student' | 'staff' | 'admin' | 'librarian';

export interface BorrowedBook {
    bookId: string;
    borrowedDate: Timestamp;
    dueDate: Timestamp;
    returnedDate?: Timestamp;
    status: 'borrowed' | 'returned';
}

export interface BorrowedBookInfo {
    user: UserProfile;
    book: Book;
    borrowed: BorrowedBook;
}

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    role: UserRole;
    regNumber: string | null;
    borrowedBooks?: BorrowedBook[];
    createdAt?: Timestamp;
    photoUrl?: string;
}

const usersCollection = collection(db, 'users');

// CREATE a new user profile
export const addUser = async (userData: Omit<UserProfile, 'createdAt' | 'photoUrl' | 'borrowedBooks'>) => {
    const userRef = doc(usersCollection, userData.uid);
    const dataWithTimestamp = {
        ...userData,
        borrowedBooks: [],
        createdAt: serverTimestamp(),
        photoUrl: '',
    };
    await setDoc(userRef, dataWithTimestamp, { merge: true });
};

// READ a user profile
export const getUser = async (uid: string): Promise<UserProfile | null> => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    }
    return null;
};

// READ ALL users
export const getUsers = async (): Promise<UserProfile[]> => {
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
}

// UPDATE a user profile
export const updateUser = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
};


// UPDATE a user's role
export const updateUserRole = async (uid: string, role: UserRole) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role });
};


// GET ALL BORROWED BOOKS
export const getAllBorrowedBooks = async (): Promise<BorrowedBookInfo[]> => {
    const allUsers = await getUsers();
    const borrowedBookInfos: BorrowedBookInfo[] = [];

    for (const user of allUsers) {
        if (user.borrowedBooks && user.borrowedBooks.length > 0) {
            const currentlyBorrowed = user.borrowedBooks.filter(b => b.status === 'borrowed');
            for (const borrowed of currentlyBorrowed) {
                const book = await getBook(borrowed.bookId);
                if (book) {
                    borrowedBookInfos.push({ user, book, borrowed });
                }
            }
        }
    }
    
    // Sort by most recent borrow date
    borrowedBookInfos.sort((a, b) => b.borrowed.borrowedDate.seconds - a.borrowed.borrowedDate.seconds);
    
    return borrowedBookInfos;
}


// A function to be called from the login page to ensure default staff users exist
export const ensureDefaultUsers = async () => {
    try {
        await ensureDefaultUsersOnClient();
    } catch (error) {
        console.error("Could not ensure default users from client:", error);
        // Fail silently to the user, but log it.
    }
};
