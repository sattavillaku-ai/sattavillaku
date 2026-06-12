'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Loader2, Upload, ArrowLeft, GripVertical, Trash2, Edit2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Article Item Component
function SortableArticle({ article, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: article.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold font-serif">{article.title}</h4>
        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
          <span>{article.author_name}</span>
          <span className="bg-primary/10 text-primary px-2 rounded-full">{article.content_type}</span>
          {article.is_preview && <span className="bg-green-100 text-green-700 px-2 rounded-full">முன்னோட்டம் (Preview)</span>}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => onEdit(article)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"><Edit2 className="h-4 w-4" /></button>
        <button type="button" onClick={() => onDelete(article.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

export default function EditIssuePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  // Load Issue Data
  useEffect(() => {
    const fetchIssue = async () => {
      const res = await fetch(`/api/admin/issues/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        reset(data);
        setCoverImage(data.cover_image_url);
      }
    };
    const fetchArticles = async () => {
      const res = await fetch(`/api/admin/issues/${params.id}/content`);
      if (res.ok) setArticles(await res.json());
    };
    fetchIssue();
    fetchArticles();
  }, [params.id, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Similar to new/page.tsx
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, cover_image_url: coverImage };
      const res = await fetch(`/api/admin/issues/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) alert('சேமிக்கப்பட்டது!');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // DnD Handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setArticles((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArticles = arrayMove(items, oldIndex, newIndex);
        // Call API to update positions here...
        return newArticles;
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/issues" className="p-2 hover:bg-accent rounded-full"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-3xl font-bold font-serif">இதழை திருத்து (Edit Issue)</h1>
        </div>
        <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-bold flex items-center gap-2">
           {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} சேமி
        </button>
      </div>

      <form className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
         {/* ... (Same fields as new/page.tsx) ... */}
         <div>
            <label className="block text-sm font-medium mb-2 font-sans">இதழ் தலைப்பு</label>
            <input {...register('title')} className="w-full p-3 rounded-md border bg-background font-serif text-lg" />
         </div>
      </form>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-serif flex items-center gap-2">
            கட்டுரைகள் (Articles)
            <span className="bg-primary text-primary-foreground text-sm px-2 py-0.5 rounded-full">{articles.length}</span>
          </h2>
          <button className="text-sm bg-accent text-accent-foreground px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-muted">
            <PlusCircle className="h-4 w-4" /> கட்டுரை சேர்
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={articles} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {articles.map((article) => (
                <SortableArticle key={article.id} article={article} onEdit={() => {}} onDelete={() => {}} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
