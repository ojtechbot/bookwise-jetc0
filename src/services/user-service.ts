
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

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
    role: 'student' | 'staff';
    regNumber: string | null;
    borrowedBooks?: BorrowedBook[];
}

const usersCollection = collection(db, 'users');

// CREATE a new user profile
export const addUser = async (userData: UserProfile) => {
    const userRef = doc(usersCollection, userData.uid);
    await setDoc(userRef, userData, { merge: true });
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

// UPDATE a user profile
export const updateUser = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
};
