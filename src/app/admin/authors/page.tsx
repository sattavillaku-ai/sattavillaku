'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Check, X, UploadCloud } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Author } from '@/types';

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState('');

  useEffect(() => {
    setAuthors(dataService.getAuthors());
  }, []);

  const handleOpenAdd = () => {
    setEditingAuthor(null);
    setName('');
    setRole('பத்தி எழுத்தாளர் (Columnist)');
    setBio('');
    setPhoto('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
    setShowAddModal(true);
  };

  const handleOpenEdit = (author: Author) => {
    setEditingAuthor(author);
    setName(author.name);
    setRole(author.role);
    setBio(author.bio);
    setPhoto(author.photo);
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const authorToSave: Author = {
      id: editingAuthor?.id || `auth-${Date.now()}`,
      name,
      role,
      bio,
      photo: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      articlesCount: editingAuthor?.articlesCount || 0,
    };

    dataService.saveAuthor(authorToSave);
    setAuthors(dataService.getAuthors());
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('இந்த ஆசிரியரை நிச்சயமாக நீக்க வேண்டுமா?')) {
      dataService.deleteAuthor(id);
      setAuthors(dataService.getAuthors());
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-tamil">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            ஆசிரியர் குழு மேலாண்மை (Editorial Authors)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            கட்டுரையாளர்கள், சட்ட ஆலோசகர்கள், மற்றும் பத்தி எழுத்தாளர்களின் சுயவிவரங்கள்
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>புதிய எழுத்தாளர் சேர்க்க (Add Author)</span>
        </button>
      </div>

      {/* Grid of Authors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {authors.map((author) => (
          <div
            key={author.id}
            className="p-5 rounded-lg bg-card border border-border flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all space-y-4"
          >
            <div className="flex items-start gap-4">
              <img
                src={author.photo}
                alt={author.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-base text-foreground leading-tight">{author.name}</div>
                <div className="text-xs font-semibold text-primary mt-0.5">{author.role}</div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                  {author.bio}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                கட்டுரைகள்: <strong className="text-foreground">{author.articlesCount || 0}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(author)}
                  className="px-2.5 py-1 rounded-xs border border-border hover:bg-muted text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>திருத்து</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(author.id)}
                  className="p-1.5 rounded-xs border border-border hover:bg-destructive/10 text-destructive"
                  title="நீக்கு"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                {editingAuthor ? 'எழுத்தாளர் விவரங்களைத் திருத்து' : 'புதிய எழுத்தாளர் சேர்த்தல்'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs font-tamil">
              <div className="space-y-1">
                <label className="font-bold text-foreground">பெயர் (Full Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="வழக்கறிஞர் கே. எஸ். இளங்கோவன்"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">பதவி / பங்கு (Role)</label>
                <input
                  type="text"
                  required
                  placeholder="முதன்மை ஆசிரியர் / அரசியல் ஆய்வாளர்"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">புகைப்பட URL (Photo URL)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">சுயகுறிப்பு (Bio)</label>
                <textarea
                  rows={4}
                  placeholder="சட்ட நிபுணத்துவம், அனுபவம், நீதிமன்றப் பயிற்சி பற்றிய குறிப்பு..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground leading-relaxed resize-y"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-md border border-border hover:bg-muted"
                >
                  ரத்து
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-bold"
                >
                  சேமி
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
