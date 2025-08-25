import { db } from '@/lib/firebase';
import { collection, doc, getDocs, runTransaction, increment, where, query, orderBy, serverTimestamp } from 'firebase/firestore';

export interface ReviewData {
    userId: string;
    userName: string;
    userAvatar: string;
    rating: number;
    comment: string;
}

export interface Review extends ReviewData {
  id: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export const submitReview = async (bookId: string, review: ReviewData) => {
  const bookRef = doc(db, 'books', bookId);
  const reviewsCollectionRef = collection(bookRef, 'reviews');
  const userReviewQuery = query(reviewsCollectionRef, where('userId', '==', review.userId));

  await runTransaction(db, async (transaction) => {
    const bookDoc = await transaction.get(bookRef);
    if (!bookDoc.exists()) {
      throw new Error("Book not found.");
    }
    
    // Check if user has already reviewed
    const userReviewSnapshot = await getDocs(userReviewQuery);
    if (!userReviewSnapshot.empty) {
        throw new Error("You have already submitted a review for this book.");
    }

    // Add the new review
    const newReviewRef = doc(reviewsCollectionRef);
    transaction.set(newReviewRef, { ...review, createdAt: serverTimestamp() });

    // Update aggregate data on the book
    const currentReviewCount = bookDoc.data().reviewCount || 0;
    const currentAverageRating = bookDoc.data().averageRating || 0;
    
    const newReviewCount = currentReviewCount + 1;
    const newAverageRating = ((currentAverageRating * currentReviewCount) + review.rating) / newReviewCount;

    transaction.update(bookRef, {
      reviewCount: increment(1),
      averageRating: newAverageRating,
    });
  });
};


export const getReviews = async (bookId: string): Promise<Review[]> => {
  const reviewsCol = collection(db, 'books', bookId, 'reviews');
  const q = query(reviewsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
};
