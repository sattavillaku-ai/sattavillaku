'use client';

import { useState } from 'react';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setStatus('loading');
    setErrorMessage('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'செய்தி அனுப்புவதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.');
        setStatus('error');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'செய்தி அனுப்புவதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.');
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input 
        type="text" 
        placeholder="உங்கள் பெயர்" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full p-3 rounded-lg border bg-background"
      />
      <input 
        type="email" 
        placeholder="உங்கள் மின்னஞ்சல்" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-3 rounded-lg border bg-background"
      />
      <textarea 
        placeholder="உங்கள் செய்தி" 
        rows={4} 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        className="w-full p-3 rounded-lg border bg-background"
      ></textarea>

      {status === 'success' && (
        <p className="text-green-600 text-sm font-bold">செய்தி வெற்றிகரமாக அனுப்பப்பட்டது! (Message sent successfully!)</p>
      )}
      {status === 'error' && (
        <div className="text-red-600 text-sm font-bold space-y-1">
          <p>செய்தி அனுப்புவதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும். (Error sending message. Please try again.)</p>
          {errorMessage && <p className="text-xs font-semibold opacity-90 bg-red-50 dark:bg-red-950/30 p-2 rounded border border-red-200 dark:border-red-900/50 mt-1">விவரம் (Detail): {errorMessage}</p>}
        </div>
      )}

      <button 
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        {status === 'loading' ? 'அனுப்பப்படுகிறது...' : 'அனுப்புக'}
      </button>
    </form>
  );
}
