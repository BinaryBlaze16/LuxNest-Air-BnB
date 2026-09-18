import React, { useState } from 'react';
import { Star, Trash2, Send, Sparkles, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function ReviewSection({ listing, onReviewAdded, onReviewDeleted }) {
  const { user, profile, openAuthModal } = useAuth();
  
  const [rating, setRating] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [accuracy, setAccuracy] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [location, setLocation] = useState(5);
  const [value, setValue] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const reviews = listing.reviews || [];

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.post(`/listings/${listing._id}/reviews`, {
        rating,
        cleanliness,
        accuracy,
        communication,
        location,
        checkIn: 5,
        value,
        comment,
      });

      if (res.data.success) {
        setComment('');
        if (onReviewAdded) onReviewAdded(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/listings/${listing._id}/reviews/${reviewId}`);
        if (onReviewDeleted) onReviewDeleted(reviewId);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete review.');
      }
    }
  };

  return (
    <div className="py-10 border-t border-slate-200 dark:border-slate-800 space-y-8">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Star className="w-7 h-7 fill-slate-900 text-slate-900 dark:fill-amber-400 dark:text-amber-400" />
          <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
            {listing.rating > 0 ? listing.rating.toFixed(2) : '5.0'} • {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </h3>
        </div>
      </div>

      {/* 6 Category Rating Breakdown Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 pt-2">
        {[
          { label: 'Cleanliness', score: '4.9' },
          { label: 'Accuracy', score: '5.0' },
          { label: 'Communication', score: '4.9' },
          { label: 'Location', score: '5.0' },
          { label: 'Check-in', score: '4.9' },
          { label: 'Value', score: '4.8' },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>{item.label}</span>
            <div className="flex items-center gap-3 flex-1 max-w-[120px]">
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 dark:bg-amber-400 rounded-full w-[96%]" />
              </div>
              <span className="text-[11px] text-slate-900 dark:text-white font-bold">{item.score}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400 col-span-2 italic">
            No reviews yet. Be the first to leave a review for this luxury stay!
          </p>
        ) : (
          reviews.map((rev) => {
            const author = rev.author || {};
            const isMyReview = user && (author._id === profile?._id || author.email === user.email);

            return (
              <div
                key={rev._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm relative group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={author.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">{author.name || 'Verified Traveler'}</h5>
                      <p className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {isMyReview && (
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition-colors ml-2"
                        title="Delete your review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Write a Review Section */}
      <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
        <h4 className="font-display font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand" />
          Leave a Review
        </h4>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Overall Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea
              rows={3}
              required
              placeholder={
                user
                  ? 'Share your experience staying at this property...'
                  : 'Please sign in to write a review'
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={!user}
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="py-2.5 px-6 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold shadow-glow flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Posting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
