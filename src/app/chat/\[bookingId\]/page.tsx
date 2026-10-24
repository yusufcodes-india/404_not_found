"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { Send, AlertTriangle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { moderateMessage } from '@/lib/moderation';

export default function ChatPage() {
  const params = useParams();
  const [messages, setMessages] = useState([
    { id: 1, sender: 'host', text: 'Hello! I see your booking for tomorrow.', time: '10:00 AM' },
    { id: 2, sender: 'renter', text: 'Hi! Just confirming the parking spot.', time: '10:05 AM' },
  ]);
  const [input, setInput] = useState('');
  const [violation, setViolation] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const mod = moderateMessage(input);
    if (mod.isViolation) {
      setViolation(`Violation: ${mod.type} detected. Sharing contact details is strictly forbidden and leads to a ban.`);
      return;
    }

    setMessages(prev => [...prev, { id: Date.now(), sender: 'renter', text: input, time: 'Now' }]);
    setInput('');
    setViolation(null);
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-kilari-main">Booking Chat</h1>
            <p className="text-sm text-kilari-muted">Booking #{params.bookingId}</p>
          </div>
          <Badge variant="success">Active</Badge>
        </div>

        <div className="bg-white rounded-3xl border border-kilari-card-border mb-6 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-widest">
            <AlertTriangle size={14} />
            Keep chats in the app. Sharing contact details leads to a permanent ban.
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-6 min-h-[50vh]">
          {messages.map(msg => (
            <div key={msg.id} className={cn(
              'flex flex-col max-w-[80%]',
              msg.sender === 'renter' ? 'ml-auto items-end' : 'items-start'
            )}>
              <div className={cn(
                'p-4 rounded-3xl text-sm leading-relaxed',
                msg.sender === 'renter'
                  ? 'bg-kilari-primary text-white rounded-tr-none'
                  : 'bg-kilari-card text-kilari-main rounded-tl-none border border-kilari-card-border'
              )}>
                {msg.text}
              </div>
              <span className="text-[10px] text-kilari-muted mt-1 px-1">{msg.time}</span>
            </div>
          ))}
        </div>

        {violation && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-medium flex items-start gap-2 animate-in slide-in-from-bottom-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            {violation}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-14 px-6 rounded-full bg-white border border-kilari-card-border outline-none focus:border-kilari-primary focus:ring-2 focus:ring-kilari-primary/20 text-kilari-main"
          />
          <Button
            className="w-14 h-14 rounded-full p-0 flex items-center justify-center"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
