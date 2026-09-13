'use client';

import React, { useState, useEffect } from 'react';
import { Tag as TagIcon, Plus, Trash2, Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Tag } from '@/types';
import { fetchTags, ensureTag, deleteTag, generateSlug } from '@/lib/cms-service';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [saving, setSaving] = useState(false);

  const loadTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTags();
      setTags(data);
    } catch (err: any) {
      setError(err.message || 'குறிச்சொற்களை ஏற்றுவதில் பிழை.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      setSaving(true);
      await ensureTag(newTagName.trim());
      setNewTagName('');
      showToast('குறிச்சொல் வெற்றிகரமாகச் சேர்க்கப்பட்டது.');
      await loadTags();
    } catch (err: any) {
      alert(err.message || 'குறிச்சொல்லைச் சேமிக்க முடியவில்லை.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    const confirmed = window.confirm(`"${tag.name}" குறிச்சொல்லை நிச்சயமாக நீக்க வேண்டுமா?`);
    if (!confirmed) return;

    try {
      await deleteTag(tag.id);
      showToast('குறிச்சொல் நீக்கப்பட்டது.');
      await loadTags();
    } catch (err: any) {
      alert(err.message || 'நீக்க முடியவில்லை.');
    }
  };

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-tamil">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TagIcon className="w-6 h-6 text-primary" />
            <span>குறிச்சொற்கள் மேலாண்மை (Tags Management)</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            கட்டுரைகளில் பயன்படுத்தப்படும் தலைப்புகள் மற்றும் சொற்பிரிவுகள் (Supabase public.tags)
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Tag & Search Form */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-card border border-border p-4 rounded-lg shadow-2xs">
        <form onSubmit={handleCreate} className="sm:col-span-6 flex items-center gap-2">
          <input
            type="text"
            required
            placeholder="புதிய குறிச்சொல் பெயர் (எ.கா: அரசியல் சாசனம்)..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>சேர் (Add)</span>
          </button>
        </form>

        <div className="sm:col-span-6 relative">
          <input
            type="text"
            placeholder="குறிச்சொற்களைத் தேட..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-8 text-center bg-card border border-border rounded-lg text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>குறிச்சொற்கள் ஏற்றப்படுகின்றன...</span>
        </div>
      )}

      {/* Tag Chips Grid */}
      {!loading && (
        <div className="bg-card border border-border rounded-lg p-5 shadow-2xs">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              குறிச்சொற்கள் எதுவும் இல்லை. மேலே உள்ள படிவத்தைப் பயன்படுத்தி உருவாக்கவும்.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {filtered.map((tag) => (
                <div
                  key={tag.id}
                  className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background hover:border-primary/40 text-xs font-semibold transition-all shadow-2xs"
                >
                  <span className="text-foreground">{tag.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono font-normal">
                    /{tag.slug}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(tag)}
                    className="text-muted-foreground hover:text-destructive opacity-40 group-hover:opacity-100 transition-opacity p-0.5 rounded-xs"
                    title="நீக்கு"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
