'use client';

import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from './StarRating';
import { MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    customerName: string | null;
    createdAt: string;
    businessReply: string | null;
    businessRepliedAt: string | null;
}

interface ReviewCardProps {
    review: Review;
    showReplyButton?: boolean;
    onReply?: (reviewId: number) => void;
}

export function ReviewCard({ review, showReplyButton, onReply }: ReviewCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="font-medium">{review.customerName || 'Anonymous'}</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(review.createdAt), 'PPP')}
                            </p>
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                    </div>

                    {/* Comment */}
                    {review.comment && (
                        <p className="text-sm text-gray-700">{review.comment}</p>
                    )}

                    {/* Business Reply */}
                    {review.businessReply && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-900">Business Response</p>
                                    <p className="text-sm text-blue-800 mt-1">{review.businessReply}</p>
                                    {review.businessRepliedAt && (
                                        <p className="text-xs text-blue-600 mt-1">
                                            {format(new Date(review.businessRepliedAt), 'PPP')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reply Button */}
                    {showReplyButton && !review.businessReply && onReply && (
                        <button
                            onClick={() => onReply(review.id)}
                            className="text-sm text-primary hover:underline mt-2"
                        >
                            Reply to review
                        </button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
