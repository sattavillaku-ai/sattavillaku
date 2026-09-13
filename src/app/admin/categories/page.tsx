'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Category } from '@/types';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  generateSlug,
} from '@/lib/cms-service';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Edit category form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameTamil, setEditNameTamil] = useState('');
  const [editNameEnglish, setEditNameEnglish] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editOrder, setEditOrder] = useState(1);
  const [savingEdit, setSavingEdit] = useState(false);

  // New category form state
  const [newNameTamil, setNewNameTamil] = useState('');
  const [newNameEnglish, setNewNameEnglish] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newOrder, setNewOrder] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [savingNew, setSavingNew] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCategories();
      setCategories(data);
      setNewOrder(data.length + 1);
    } catch (err: any) {
      setError(err.message || 'பிரிவுகளை ஏற்றுவதில் பிழை ஏற்பட்டது.');
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

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditNameTamil(cat.name || cat.nameTamil || '');
    setEditNameEnglish(cat.name_en || cat.nameEnglish || '');
    setEditSlug(cat.slug);
    setEditDescription(cat.description || '');
    setEditOrder(cat.display_order ?? cat.order ?? 1);
  };

  const handleSaveEdit = async (cat: Category) => {
    if (!editNameTamil.trim() || !editSlug.trim()) {
      alert('தமிழ் பெயர் மற்றும் URL Slug கட்டாயமாகும்.');
      return;
    }

    try {
      setSavingEdit(true);
      await updateCategory(cat.id, {
        name: editNameTamil,
        name_en: editNameEnglish,
        slug: editSlug,
        description: editDescription,
        display_order: Number(editOrder),
      });
      setEditingId(null);
      showToast('பிரிவு வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'பிரிவைத் திருத்துவதில் தோல்வி.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    const confirmed = window.confirm(
      `"${cat.name || cat.nameTamil}" பிரிவை நிச்சயமாக நீக்க வேண்டுமா?\n\nகவனிக்க: இப்பிரிவில் உள்ள கட்டுரைகள் வகைப்படுத்தப்படாமல் மாறலாம்.`
    );
    if (!confirmed) return;

    try {
      await deleteCategory(cat.id);
      showToast('பிரிவு வெற்றிகரமாக நீக்கப்பட்டது.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'பிரிவை நீக்க முடியவில்லை.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameTamil.trim()) {
      alert('தயவுசெய்து பிரிவின் தமிழ் பெயரை உள்ளிடவும்.');
      return;
    }

    const finalSlug = generateSlug(newSlug || newNameEnglish || newNameTamil);

    try {
      setSavingNew(true);
      await createCategory({
        name: newNameTamil,
        name_en: newNameEnglish,
        slug: finalSlug,
        description: newDescription,
        display_order: Number(newOrder),
      });

      setShowAddForm(false);
      setNewNameTamil('');
      setNewNameEnglish('');
      setNewSlug('');
      setNewDescription('');
      showToast('புதிய பிரிவு வெற்றிகரமாகச் சேர்க்கப்பட்டது.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'புதிய பிரிவைச் சேமிக்க முடியவில்லை.');
    } finally {
      setSavingNew(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-tamil">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            பிரிவுகள் மேலாண்மை (Categories Management)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            சட்டவிளக்கு இதழ் மற்றும் இணையதள உள்ளடக்கப் பிரிவுகளை நிர்வகித்தல் (Supabase Database Active)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>புதிய பிரிவு சேர் (Add Category)</span>
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

      {/* New Category Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="bg-card border-2 border-primary/30 rounded-lg p-5 shadow-sm space-y-4 animate-in fade-in"
        >
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
            புதிய பிரிவு விவரங்கள் (Create Category)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-foreground">தமிழ் பெயர் *</label>
              <input
                type="text"
                required
                placeholder="எ.கா: வணிகச் சட்டம்"
                value={newNameTamil}
                onChange={(e) => {
                  setNewNameTamil(e.target.value);
                  if (!newSlug) {
                    setNewSlug(generateSlug(e.target.value));
                  }
                }}
                className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">ஆங்கிலப் பெயர்</label>
              <input
                type="text"
                placeholder="Commercial Law"
                value={newNameEnglish}
                onChange={(e) => {
                  setNewNameEnglish(e.target.value);
                  if (!newSlug) {
                    setNewSlug(generateSlug(e.target.value));
                  }
                }}
                className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">URL Slug *</label>
              <input
                type="text"
                required
                placeholder="commercial-law"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">வரிசை எண் (Order)</label>
              <input
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground font-mono"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-foreground">பிரிவு விளக்கம் (Description)</label>
            <input
              type="text"
              placeholder="இப்பிரிவில் வெளியாகும் கட்டுரைகளின் உள்ளடக்கம் பற்றிய சுருக்கம்..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground"
            />
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-md border border-border hover:bg-muted cursor-pointer"
            >
              ரத்து
            </button>
            <button
              type="submit"
              disabled={savingNew}
              className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {savingNew && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{savingNew ? 'சேமிக்கப்படுகிறது...' : 'சேமி (Save Category)'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center bg-card border border-border rounded-lg text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>பிரிவுகள் தரவுத்தளத்திலிருந்து ஏற்றப்படுகின்றன...</span>
        </div>
      )}

      {/* Category List */}
      {!loading && (
        <div className="bg-card border border-border rounded-lg shadow-2xs divide-y divide-border">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              பிரிவுகள் எதுவும் இல்லை. &quot;புதிய பிரிவு சேர்&quot; பொத்தானைப் பயன்படுத்தி உருவாக்கவும்.
            </div>
          ) : (
            categories.map((cat, index) => {
              const isEditing = editingId === cat.id;

              if (isEditing) {
                return (
                  <div key={cat.id} className="p-4 bg-muted/40 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground font-bold mb-0.5 block">தமிழ் பெயர்</label>
                        <input
                          type="text"
                          value={editNameTamil}
                          onChange={(e) => setEditNameTamil(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground font-bold mb-0.5 block">ஆங்கிலப் பெயர்</label>
                        <input
                          type="text"
                          value={editNameEnglish}
                          onChange={(e) => setEditNameEnglish(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground font-bold mb-0.5 block">URL Slug</label>
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground font-bold mb-0.5 block">வரிசை</label>
                        <input
                          type="number"
                          value={editOrder}
                          onChange={(e) => setEditOrder(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground font-bold mb-0.5 block">விளக்கம்</label>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 rounded-xs border border-border hover:bg-muted cursor-pointer"
                      >
                        ரத்து
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(cat)}
                        disabled={savingEdit}
                        className="px-3 py-1 rounded-xs bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer flex items-center gap-1"
                      >
                        {savingEdit && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>{savingEdit ? 'சேமிக்கப்படுகிறது...' : 'சேமி'}</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={cat.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xs bg-muted text-muted-foreground flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                      {cat.display_order ?? index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{cat.name}</span>
                        {cat.name_en && (
                          <span className="text-xs text-muted-foreground font-sans">({cat.name_en})</span>
                        )}
                        <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded-xs text-muted-foreground">
                          /{cat.slug}
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 rounded-xs border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer"
                      title="திருத்து"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 rounded-xs border border-border bg-card text-destructive hover:bg-destructive/10 cursor-pointer"
                      title="நீக்கு"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
