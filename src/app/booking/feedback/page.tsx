"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FeedbackPage() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    // Simulation of server action to save feedback
    console.log('Saving feedback:', { rating, comment });
    setSubmitted(true);
    setTimeout(() => router.push('/map'), 2000);
  };

  return (
    <AppShell>
      <div className="p-6 max-w-md mx-auto pb-32">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold text-kilari-muted uppercase tracking-widest mb-1">SESSIONS COMPLETE</p>
          <h1 className="text-3xl font-extrabold text-kilari-main">How was it?</h1>
          <p className="text-kilari-muted text-sm mt-2">Your feedback helps the community find the best chargers.</p>
        </div>

        {!submitted ? (
          <div className="flex flex-col gap-6">
            <Card padding="lg" className="flex flex-col items-center gap-6">
              <span className="text-sm font-bold text-kilari-main uppercase tracking-wide">Rating</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star
                      size={40}
                      className={cn(
                        'transition-colors',
                        star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-kilari-card-border'
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm font-bold text-kilari-main">
                {rating === 5 ? 'Amazing!' : rating === 4 ? 'Great' : rating === 3 ? 'Okay' : rating === 2 ? 'Poor' : rating === 1 ? 'Terrible' : 'Tap a star'}
              </p>
            </Card>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-kilari-main uppercase tracking-wide px-1">Comments (Optional)</label>
              <div className="relative">
                <textarea
                  className="w-full h-32 p-4 rounded-3xl border-1.5 border-kilari-card-border outline-none focus:border-kilari-primary focus:ring-2 focus:ring-kilari-primary/20 bg-white text-kilari-main resize-none"
                  placeholder="Tell us about the experience, charger speed, or host..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
                <div className="absolute bottom-3 right-3 text-kilari-muted">
                  <MessageSquare size={18} />
                </div>
              </div>
            </div>

            <Button
              className="w-full h-14 rounded-full text-lg"
              disabled={rating === 0}
              onClick={handleSubmit}
            >
              Submit Feedback
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-kilari-primary text-white rounded-full flex items-center justify-center mb-6 shadow-lg">
              <ThumbsUp size={40} />
            </div>
            <h2 className="text-2xl font-extrabold text-kilari-main mb-2">Thank You!</h2>
            <p className="text-kilari-muted">Your feedback has been submitted successfully.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
