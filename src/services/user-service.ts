
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, Timestamp, getDocs, serverTimestamp } from 'firebase/firestore';
import usersData from '@/data/users.json';

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
}

const usersCollection = collection(db, 'users');

// CREATE a new user profile
export const addUser = async (userData: Omit<UserProfile, 'createdAt' | 'role'> & { role: 'student' | 'staff' }) => {
    const userRef = doc(usersCollection, userData.uid);
    const dataWithTimestamp = {
        ...userData,
        createdAt: serverTimestamp(),
    };
    await setDoc(userRef, dataWithTimestamp, { merge: true });
};

// READ a user profile
export const getUser = async (uid: string): Promise<UserProfile | null> => {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
        // Fallback to JSON file if user not in Firestore
        const jsonData = usersData as UserProfile[];
        const userFromJson = jsonData.find(user => user.uid === uid);
        if(userFromJson) {
            // If found in JSON, add to Firestore for future queries
             await addUser(userFromJson as any);
             return userFromJson;
        }

        return null;
    } catch (error) {
        console.error("Error getting user, trying fallback", error);
        // Fallback to JSON file in case of offline error
        const jsonData = usersData as UserProfile[];
        const userFromJson = jsonData.find(user => user.uid === uid);
        return userFromJson || null;
    }
};

// READ ALL users
export const getUsers = async (): Promise<UserProfile[]> => {
    try {
        const snapshot = await getDocs(usersCollection);
        return snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
    } catch (error) {
         console.error("Error getting all users, falling back to JSON", error);
         return usersData as UserProfile[];
    }
}

// UPDATE a user profile
export const updateUser = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
};
