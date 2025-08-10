
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Star } from 'lucide-react';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters.'),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<boolean>;
}

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });
  
  const currentRating = form.watch('rating');

  const handleFormSubmit = (values: ReviewFormValues) => {
    startTransition(async () => {
      const success = await onSubmit(values.rating, values.comment);
      if (success) {
        form.reset();
      }
    });
  };
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Rating</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <button
                        type="button"
                        key={ratingValue}
                        onClick={() => field.onChange(ratingValue)}
                        onMouseEnter={() => setHoverRating(ratingValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1"
                      >
                        <Star
                          className={`
                            h-6 w-6 cursor-pointer transition-colors 
                            ${ratingValue <= (hoverRating || currentRating) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}
                          `}
                        />
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea placeholder="Share your thoughts about this book..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Review
        </Button>
      </form>
    </Form>
  );
}
