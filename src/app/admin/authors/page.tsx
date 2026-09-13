'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, CheckCircle, AlertCircle, Loader2, X, UploadCloud, Mail } from 'lucide-react';
import { Author } from '@/types';
import { fetchAuthors, createAuthor, updateAuthor, deleteAuthor } from '@/lib/cms-service';
import { MediaPickerModal } from '@/components/admin/media-picker-modal';

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAuthors();
      setAuthors(data);
    } catch (err: any) {
      setError(err.message || 'எழுத்தாளர்களை ஏற்றுவதில் பிழை ஏற்பட்டது.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingAuthor(null);
    setName('');
    setNameEn('');
    setRole('பத்தி எழுத்தாளர் (Columnist)');
    setEmail('');
    setBio('');
    setPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
    setShowAddModal(true);
  };

  const handleOpenEdit = (author: Author) => {
    setEditingAuthor(author);
    setName(author.name);
    setNameEn(author.name_en || '');
    setRole(author.role);
    setEmail(author.email || '');
    setBio(author.bio || '');
    setPhotoUrl(author.photo_url || author.photo || '');
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('எழுத்தாளர் பெயர் கட்டாயமாகும்.');
      return;
    }

    try {
      setSaving(true);
      if (editingAuthor) {
        await updateAuthor(editingAuthor.id, {
          name: name.trim(),
          name_en: nameEn.trim() || undefined,
          role: role.trim() || 'பத்தி எழுத்தாளர்',
          email: email.trim() || undefined,
          bio: bio.trim() || undefined,
          photo_url: photoUrl.trim() || undefined,
        });
        showToast('எழுத்தாளர் விவரங்கள் வெற்றிகரமாகப் புதுப்பிக்கப்பட்டன.');
      } else {
        await createAuthor({
          name: name.trim(),
          name_en: nameEn.trim() || undefined,
          role: role.trim() || 'பத்தி எழுத்தாளர்',
          email: email.trim() || undefined,
          bio: bio.trim() || undefined,
          photo_url: photoUrl.trim() || undefined,
        });
        showToast('புதிய எழுத்தாளர் வெற்றிகரமாகச் சேர்க்கப்பட்டார்.');
      }

      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'எழுத்தாளரைச் சேமிக்க முடியவில்லை.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (author: Author) => {
    const confirmed = window.confirm(
      `"${author.name}" எழுத்தாளரை நிச்சயமாக நீக்க வேண்டுமா?\n\nகவனிக்க: தொடர்புடைய கட்டுரைகளில் ஆசிரியர் விவரங்கள் பாதிக்கப்படலாம்.`
    );
    if (!confirmed) return;

    try {
      await deleteAuthor(author.id);
      showToast('எழுத்தாளர் வெற்றிகரமாக நீக்கப்பட்டார்.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'எழுத்தாளரை நீக்க முடியவில்லை.');
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
            கட்டுரையாளர்கள், சட்ட ஆலோசகர்கள், மற்றும் பத்தி எழுத்தாளர்களின் விவரங்கள் (Supabase Database Active)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>புதிய எழுத்தாளர் சேர்க்க (Add Author)</span>
        </button>
      </div>

      {/* Notifications */}
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

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center bg-card border border-border rounded-lg text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>எழுத்தாளர்கள் பட்டியல் ஏற்றப்படுகிறது...</span>
        </div>
      )}

      {/* Grid of Authors */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {authors.length === 0 ? (
            <div className="col-span-2 p-8 text-center bg-card border border-border rounded-lg text-muted-foreground text-xs">
              எழுத்தாளர்கள் யாரும் பதிவு செய்யப்படவில்லை. &quot;புதிய எழுத்தாளர் சேர்க்க&quot; பொத்தானைப் பயன்படுத்தி உருவாக்கவும்.
            </div>
          ) : (
            authors.map((author) => (
              <div
                key={author.id}
                className="p-5 rounded-lg bg-card border border-border flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all space-y-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={author.photo_url || author.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                    alt={author.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <div className="font-bold text-base text-foreground leading-tight">{author.name}</div>
                      {author.name_en && (
                        <div className="text-xs text-muted-foreground font-sans">({author.name_en})</div>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-primary mt-0.5">{author.role}</div>
                    {author.email && (
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1 font-sans">
                        <Mail className="w-3 h-3" />
                        <span>{author.email}</span>
                      </div>
                    )}
                    {author.bio && (
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                        {author.bio}
                      </p>
                    )}
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
                      className="px-2.5 py-1 rounded-xs border border-border hover:bg-muted text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>திருத்து</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(author)}
                      className="p-1.5 rounded-xs border border-border hover:bg-destructive/10 text-destructive cursor-pointer"
                      title="நீக்கு"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

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
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs font-tamil">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">தமிழ் பெயர் *</label>
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
                  <label className="font-bold text-foreground">ஆங்கிலப் பெயர்</label>
                  <input
                    type="text"
                    placeholder="Adv. K.S. Elangovan"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">பதவி / பங்கு (Role) *</label>
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
                  <label className="font-bold text-foreground">மின்னஞ்சல் (Email)</label>
                  <input
                    type="email"
                    placeholder="editor@sattavilakku.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground flex items-center justify-between">
                  <span>புகைப்பட URL (Photo URL)</span>
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="text-primary hover:underline text-xs flex items-center gap-1 cursor-pointer font-normal"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>மீடியா நூலகத்திலிருந்து தேர்வு / பதிவேற்று</span>
                  </button>
                </label>
                <div className="flex items-center gap-3">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 text-muted-foreground text-xs font-bold">
                      ?
                    </div>
                  )}
                  <input
                    type="url"
                    placeholder="https://..."
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground font-sans text-xs"
                  />
                </div>
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
                  className="px-3 py-1.5 rounded-md border border-border hover:bg-muted cursor-pointer"
                >
                  ரத்து
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'சேமிக்கப்படுகிறது...' : 'சேமி (Save Author)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(media) => {
          setPhotoUrl(media.url);
        }}
        title="எழுத்தாளர் புகைப்படத்தைத் தேர்வு செய்யவும் (Select Author Photo)"
        categoryFilter="author"
      />
    </div>
  );
}
