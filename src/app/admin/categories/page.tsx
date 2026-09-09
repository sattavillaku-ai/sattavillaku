'use client';

import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit, Trash2, ArrowUpDown, Check, X } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameTamil, setEditNameTamil] = useState('');
  const [editNameEnglish, setEditNameEnglish] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // New category form
  const [newNameTamil, setNewNameTamil] = useState('');
  const [newNameEnglish, setNewNameEnglish] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    setCategories(dataService.getCategories());
  }, []);

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditNameTamil(cat.nameTamil);
    setEditNameEnglish(cat.nameEnglish);
    setEditSlug(cat.slug);
    setEditDescription(cat.description);
  };

  const handleSaveEdit = (cat: Category) => {
    const updated: Category = {
      ...cat,
      nameTamil: editNameTamil,
      nameEnglish: editNameEnglish,
      slug: editSlug,
      description: editDescription,
    };
    dataService.saveCategory(updated);
    setCategories(dataService.getCategories());
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('இந்தப் பிரிவை நிச்சயமாக நீக்க வேண்டுமா?')) {
      dataService.deleteCategory(id);
      setCategories(dataService.getCategories());
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameTamil || !newSlug) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      slug: newSlug,
      nameTamil: newNameTamil,
      nameEnglish: newNameEnglish,
      description: newDescription,
      order: categories.length + 1,
    };

    dataService.saveCategory(newCat);
    setCategories(dataService.getCategories());
    setShowAddForm(false);
    setNewNameTamil('');
    setNewNameEnglish('');
    setNewSlug('');
    setNewDescription('');
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
            சட்டம், அரசியல், தமிழ்நாடு, இந்தியா, சிறப்புக் கட்டுரைகள் போன்ற பகுதிகளை நிர்வகித்தல்
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>புதிய பிரிவு சேர் (Add Category)</span>
        </button>
      </div>

      {/* New Category Form Modal / Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="bg-card border-2 border-primary/30 rounded-lg p-5 shadow-sm space-y-4 animate-in fade-in"
        >
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
            புதிய பிரிவு விவரங்கள்
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-foreground">தமிழ் பெயர் *</label>
              <input
                type="text"
                required
                placeholder="எ.கா: வணிகச் சட்டம்"
                value={newNameTamil}
                onChange={(e) => {
                  setNewNameTamil(e.target.value);
                  setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
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
                onChange={(e) => setNewNameEnglish(e.target.value)}
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
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-foreground">பிரிவு விளக்கம்</label>
            <input
              type="text"
              placeholder="இப்பிரிவில் வெளியாகும் கட்டுரைகளின் உள்ளடக்கம்..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground"
            />
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
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
      )}

      {/* Category List */}
      <div className="bg-card border border-border rounded-lg shadow-2xs divide-y divide-border">
        {categories.map((cat, index) => {
          const isEditing = editingId === cat.id;

          if (isEditing) {
            return (
              <div key={cat.id} className="p-4 bg-muted/40 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={editNameTamil}
                    onChange={(e) => setEditNameTamil(e.target.value)}
                    className="px-3 py-1.5 rounded-md border border-border bg-background text-foreground font-bold"
                  />
                  <input
                    type="text"
                    value={editNameEnglish}
                    onChange={(e) => setEditNameEnglish(e.target.value)}
                    className="px-3 py-1.5 rounded-md border border-border bg-background text-foreground font-sans"
                  />
                  <input
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    className="px-3 py-1.5 rounded-md border border-border bg-background text-foreground font-sans"
                  />
                </div>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-2.5 py-1 rounded-xs border border-border hover:bg-muted"
                  >
                    ரத்து
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(cat)}
                    className="px-3 py-1 rounded-xs bg-primary text-primary-foreground font-bold"
                  >
                    சேமி
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
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{cat.nameTamil}</span>
                    <span className="text-xs text-muted-foreground font-sans">({cat.nameEnglish})</span>
                    <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded-xs text-muted-foreground">
                      /{cat.slug}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleStartEdit(cat)}
                  className="p-1.5 rounded-xs border border-border bg-card text-muted-foreground hover:text-foreground"
                  title="திருத்து"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 rounded-xs border border-border bg-card text-destructive hover:bg-destructive/10"
                  title="நீக்கு"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
