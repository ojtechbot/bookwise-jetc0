
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Star, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return <p className="text-muted-foreground mt-4">No reviews yet. Be the first to write one!</p>;
  }

  return (
    <div className="mt-6 space-y-6">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-4 flex gap-4">
            <Avatar>
              <AvatarImage src={review.userAvatar} alt={review.userName} />
              <AvatarFallback><User /></AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{review.userName}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt.seconds * 1000), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} />
                    ))}
                  </div>
              </div>
              <p className="mt-2 text-sm text-foreground/90">{review.comment}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
