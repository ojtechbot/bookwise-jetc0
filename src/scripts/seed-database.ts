
'use strict';
require('dotenv').config({ path: '.env.local' });

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import initialBooksData from '../data/books.json';
import defaultStaff from '../data/staff.json';

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

const initialUsers = defaultStaff.map(staff => ({
  email: staff.email,
  password: staff.password,
  displayName: staff.name,
  role: staff.name.toLowerCase() as 'admin' | 'librarian',
  regNumber: null,
}));


async function seedUsers() {
  console.log('Starting to seed users...');
  for (const userData of initialUsers) {
    const { email, password, displayName, role, regNumber } = userData;
    let uid: string;

    try {
      const userRecord = await auth.getUserByEmail(email);
      uid = userRecord.uid;
      console.log(`User ${email} already exists. Updating password and profile.`);
      await auth.updateUser(uid, {
        password: password,
        displayName: displayName,
      });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log(`User ${email} not found. Creating new user.`);
        const newUserRecord = await auth.createUser({
          email,
          password,
          displayName,
        });
        uid = newUserRecord.uid;
        console.log(`Successfully created auth user: ${email} with UID: ${uid}`);
      } else {
        console.error(`Error fetching auth user ${email}:`, error);
        continue;
      }
    }

    try {
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
      }, { merge: true });
      console.log(`Successfully created/updated Firestore profile for: ${email}`);
    } catch (dbError) {
      console.error(`Error creating/updating Firestore profile for ${email}:`, dbError);
    }
  }
  console.log('User seeding finished.');
}


async function seedBooks() {
    console.log('Starting to seed books...');
    const booksCollectionRef = db.collection('books');
    const snapshot = await booksCollectionRef.limit(1).get();
    
    if (!snapshot.empty) {
        console.log('Books collection already has data. Skipping book seeding.');
        return;
    }

    const batch = db.batch();
    initialBooksData.forEach((book) => {
        const bookRef = booksCollectionRef.doc(book.id);
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
