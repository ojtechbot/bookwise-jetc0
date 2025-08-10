
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp, WriteBatch } from 'firebase-admin/firestore';
import { config } from 'dotenv';

// Load environment variables from .env file
config({ path: '.env.local' });
config();

import initialBooksData from '../data/books.json';

// IMPORTANT: Download your service account key from Firebase Console
// and place it in the root of your project. Rename it to 'service-account.json'.
// Make sure to add 'service-account.json' to your .gitignore file.
const serviceAccount = require('../../service-account.json');

const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
  : getApps()[0];

const auth = getAuth(adminApp);
const db = getFirestore(adminApp);

const initialUsers = [
  {
    uid: 'admin-user-placeholder',
    email: 'admin@libroweb.io',
    password: 'admin123',
    displayName: 'Admin User',
    role: 'admin',
    regNumber: null,
  },
  {
    uid: 'librarian-user-placeholder',
    email: 'librarian@libroweb.io',
    password: 'librarian123',
    displayName: 'Librarian User',
    role: 'librarian',
    regNumber: null,
  },
];

async function seedUsers() {
  console.log('Starting to seed users...');
  for (const userData of initialUsers) {
    const { uid, email, password, displayName, role, regNumber } = userData;
    try {
      // Create user in Firebase Auth
      await auth.createUser({
        uid,
        email,
        password,
        displayName,
      });
      console.log(`Successfully created auth user: ${email}`);

      // Create user profile in Firestore
      const userRef = db.collection('users').doc(uid);
      await userRef.set({
        uid,
        name: displayName,
        email,
        role,
        regNumber,
        borrowedBooks: [],
        createdAt: Timestamp.now(),
        photoUrl: '',
      });
      console.log(`Successfully created firestore profile for: ${email}`);
    } catch (error: any) {
      if (error.code === 'auth/uid-already-exists' || error.code === 'auth/email-already-exists') {
        console.log(`User ${email} already exists. Skipping...`);
      } else {
        console.error(`Error creating user ${email}:`, error);
      }
    }
  }
  console.log('User seeding finished.');
}

async function seedBooks() {
    console.log('Starting to seed books...');
    const batch = db.batch();
    const booksCollection = db.collection('books');

    // Check if books already exist to prevent re-seeding
    const snapshot = await booksCollection.limit(1).get();
    if (!snapshot.empty) {
        console.log('Books collection already has data. Skipping book seeding.');
        return;
    }

    initialBooksData.forEach((book) => {
        const bookRef = booksCollection.doc(book.id);
        const createdAtTimestamp = book.createdAt 
            ? new Timestamp(book.createdAt.seconds, book.createdAt.nanoseconds) 
            : Timestamp.now();
        
        batch.set(bookRef, { 
            ...book, 
            createdAt: createdAtTimestamp, 
            reviewCount: 0, 
            averageRating: 0 
        });
    });

    try {
        await batch.commit();
        console.log("Initial books have been seeded successfully.");
    } catch (error) {
        console.error("Error seeding initial books: ", error);
    }
}


async function main() {
    console.log('Starting database seed process...');
    await seedUsers();
    await seedBooks();
    console.log('Database seeding complete!');
}

main().catch((error) => {
  console.error('An error occurred during the seeding process:', error);
});
