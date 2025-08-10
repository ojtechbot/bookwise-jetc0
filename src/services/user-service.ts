
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, Timestamp, getDocs, serverTimestamp } from 'firebase/firestore';

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
    createdAt?: Timestamp;
}

const usersCollection = collection(db, 'users');

// CREATE a new user profile
export const addUser = async (userData: Omit<UserProfile, 'createdAt'>) => {
    const userRef = doc(usersCollection, userData.uid);
    const dataWithTimestamp = {
        ...userData,
        createdAt: serverTimestamp(),
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
