
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
    const { uid: placeholderUid, email, password, displayName, role, regNumber } = userData;
    let userRecord;
    let finalUid;

    try {
      // Check if user exists by email
      userRecord = await auth.getUserByEmail(email);
      finalUid = userRecord.uid;
      console.log(`User ${email} already exists. Updating password and profile.`);
      
      // Update password to ensure it matches the seed data
      await auth.updateUser(finalUid, {
        password: password,
        displayName: displayName,
      });

    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // User does not exist, so create them
        console.log(`User ${email} not found. Creating new user.`);
        userRecord = await auth.createUser({
          email,
          password,
          displayName,
        });
        finalUid = userRecord.uid;
        console.log(`Successfully created auth user: ${email}`);
      } else {
        // For other errors, log them and skip this user
        console.error(`Error processing user ${email}:`, error);
        continue;
      }
    }
    
    // At this point, we have a finalUid, so we can create/update the Firestore profile
    try {
        const userRef = db.collection('users').doc(finalUid);
        await userRef.set({
            uid: finalUid,
            name: displayName,
            email,
            role,
            regNumber,
            borrowedBooks: [],
            createdAt: Timestamp.now(),
            photoUrl: '',
        }, { merge: true }); // Use merge to avoid overwriting existing data fields
        console.log(`Successfully created/updated Firestore profile for: ${email}`);
    } catch (dbError) {
        console.error(`Error creating/updating Firestore profile for ${email}:`, dbError);
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
