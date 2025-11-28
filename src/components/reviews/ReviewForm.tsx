'use client';

import { useState } from 'react';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ReviewFormProps {
    appointmentId: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ReviewForm({ appointmentId, onSuccess, onCancel }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('client_token');
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    appointmentId,
                    rating,
                    comment: comment.trim() || null,
                }),
            });

            if (response.ok) {
                toast.success('Review submitted successfully!');
                if (onSuccess) onSuccess();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to submit review');
            }
        } catch (error) {
            toast.error('An error occurred while submitting your review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Your Rating *</Label>
                <div className="mt-2">
                    <StarRating
                        rating={rating}
                        interactive
                        onRatingChange={setRating}
                        size="lg"
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="comment">Your Review (Optional)</Label>
                <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this service..."
                    rows={4}
                    className="mt-2"
                />
            </div>

            <div className="flex gap-2 justify-end">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting || rating === 0}>
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </div>
        </form>
    );
}
