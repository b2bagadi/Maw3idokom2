'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { Edit, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    customerName: string | null;
    createdAt: string;
    businessReply: string | null;
    businessRepliedAt: string | null;
    tenantId: number;
}

interface ReviewsManagementProps {
    reviews: Review[];
    onUpdate: () => void;
    userRole: 'admin' | 'business';
}

export function ReviewsManagement({ reviews, onUpdate, userRole }: ReviewsManagementProps) {
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [replyingReview, setReplyingReview] = useState<Review | null>(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEditClick = (review: Review) => {
        setEditingReview(review);
        setEditRating(review.rating);
        setEditComment(review.comment || '');
    };

    const handleReplyClick = (review: Review) => {
        setReplyingReview(review);
        setReplyText(review.businessReply || '');
    };

    const handleSaveEdit = async () => {
        if (!editingReview) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`/api/admin/reviews/${editingReview.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating: editRating,
                    comment: editComment
                })
            });

            if (response.ok) {
                toast.success('Review updated successfully');
                setEditingReview(null);
                onUpdate();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to update review');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveReply = async () => {
        if (!replyingReview) return;

        setIsSubmitting(true);
        try {
            const token = userRole === 'admin'
                ? localStorage.getItem('admin_token')
                : localStorage.getItem('business_token');
            const response = await fetch(`/api/business/reviews/${replyingReview.id}/reply`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    businessReply: replyText
                })
            });

            if (response.ok) {
                toast.success('Reply added successfully');
                setReplyingReview(null);
                onUpdate();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to add reply');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (reviewId: number) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success('Review deleted successfully');
                onUpdate();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to delete review');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    return (
        <>
            <div className="space-y-4">
                {reviews.map((review) => (
                    <Card key={review.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-base">{review.customerName || 'Anonymous'}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(review.createdAt), 'PPP')}
                                    </p>
                                    <div className="mt-2">
                                        <StarRating rating={review.rating} size="sm" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {userRole === 'admin' && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditClick(review)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(review.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                    {!review.businessReply && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleReplyClick(review)}
                                        >
                                            <MessageSquare className="h-4 w-4 mr-1" />
                                            Reply
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {review.comment && (
                                <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                            )}
                            {review.businessReply && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                    <p className="text-sm font-medium text-blue-900 mb-1">Business Response</p>
                                    <p className="text-sm text-blue-800">{review.businessReply}</p>
                                    {review.businessRepliedAt && (
                                        <p className="text-xs text-blue-600 mt-1">
                                            {format(new Date(review.businessRepliedAt), 'PPP')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Review Dialog */}
            <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Review</DialogTitle>
                        <DialogDescription>Update the rating and comment for this review</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Rating</Label>
                            <div className="mt-2">
                                <StarRating
                                    rating={editRating}
                                    interactive
                                    onRatingChange={setEditRating}
                                    size="lg"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Comment</Label>
                            <Textarea
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                placeholder="Review comment..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingReview(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reply Dialog */}
            <Dialog open={!!replyingReview} onOpenChange={() => setReplyingReview(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reply to Review</DialogTitle>
                        <DialogDescription>Add a response to this customer review</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Your Reply</Label>
                            <Textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Thank you for your feedback..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReplyingReview(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveReply} disabled={isSubmitting || !replyText.trim()}>
                            {isSubmitting ? 'Sending...' : 'Send Reply'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
