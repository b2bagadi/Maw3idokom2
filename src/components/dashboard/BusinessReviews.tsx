'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/reviews/StarRating';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    customerName: string | null;
    createdAt: string;
    businessReply: string | null;
    businessRepliedAt: string | null;
}

interface BusinessReviewsProps {
    tenantId: number;
}

export function BusinessReviews({ tenantId }: BusinessReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [replyDialogOpen, setReplyDialogOpen] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [tenantId]);

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('business_token');
            const response = await fetch(`/api/reviews?tenantId=${tenantId}&onlyApproved=false`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setReviews(data.reviews || []);
                setAverageRating(data.averageRating || 0);
                setTotalReviews(data.totalReviews || 0);
            }
        } catch (error) {
            toast.error('Failed to load reviews');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim() || !replyingTo) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('business_token');
            const response = await fetch(`/api/reviews/${replyingTo}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reply: replyText.trim() })
            });

            if (response.ok) {
                toast.success('Reply posted successfully!');
                setReplyDialogOpen(false);
                setReplyText('');
                setReplyingTo(null);
                fetchReviews();
            } else {
                toast.error('Failed to post reply');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                        Customer Reviews
                    </CardTitle>
                    <CardDescription>
                        {totalReviews > 0 ? (
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-2">
                                    <StarRating rating={averageRating} size="md" />
                                    <span className="text-2xl font-bold text-foreground">
                                        {averageRating.toFixed(1)}
                                    </span>
                                </div>
                                <span className="text-muted-foreground">
                                    ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                                </span>
                            </div>
                        ) : (
                            <p className="text-muted-foreground mt-2">No reviews yet</p>
                        )}
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">
                            No reviews yet
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Customer reviews will appear here after they rate your services
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            showReplyButton={!review.businessReply}
                            onReply={(reviewId) => {
                                setReplyingTo(reviewId);
                                setReplyDialogOpen(true);
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Reply Dialog */}
            <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reply to Review</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your response to the customer..."
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setReplyDialogOpen(false);
                                setReplyText('');
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReply}
                            disabled={isSubmitting || !replyText.trim()}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                'Post Reply'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
