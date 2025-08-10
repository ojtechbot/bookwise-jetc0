
'use client';

import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, Timestamp, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore';
import initialUsers from '@/data/users.json';

export interface BorrowedBook {
    bookId: string;
    borrowedDate: Timestamp;
    dueDate: Timestamp;
    returnedDate?: Timestamp;
    status: 'borrowed' | 'returned';
}

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    role: 'student' | 'staff' | 'admin' | 'librarian';
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
    
    // Seed users if user not found (useful for first-time login of mock users)
    const allUsersSnapshot = await getDocs(usersCollection);
    if (allUsersSnapshot.empty) {
        console.log('No users found, seeding initial data...');
        await seedInitialUsers();
        // Try fetching again after seeding
        const seededDocSnap = await getDoc(docRef);
         if (seededDocSnap.exists()) {
            return seededDocSnap.data() as UserProfile;
        }
    }

    return null;
};

// READ ALL users
export const getUsers = async (): Promise<UserProfile[]> => {
    const snapshot = await getDocs(usersCollection);
    // If the database is empty, seed it with initial data
    if (snapshot.empty) {
        console.log("No users found in Firestore, seeding initial users...");
        await seedInitialUsers();
        const seededSnapshot = await getDocs(usersCollection);
        return seededSnapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
    }
    return snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
}

// UPDATE a user profile
export const updateUser = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
};

// Seed initial users from JSON file
export const seedInitialUsers = async () => {
    const batch = writeBatch(db);
    initialUsers.forEach((user) => {
        // Use the `uid` from JSON as the document ID in Firestore
        const userRef = doc(db, 'users', user.uid);
        const { password, ...userData } = user;
        batch.set(userRef, {
            ...userData,
            createdAt: serverTimestamp(),
            photoUrl: '',
            borrowedBooks: []
        });
    });
    try {
        await batch.commit();
        console.log("Initial users have been seeded successfully.");
    } catch (error) {
        console.error("Error seeding initial users: ", error);
    }
};
