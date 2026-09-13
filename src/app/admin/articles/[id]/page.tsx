'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchArticleById } from '@/lib/cms-service';
import { Article } from '@/types';
import { ArticleForm } from '@/components/admin/article-form';
import { EmptyState } from '@/components/empty-state';
import { Loader2 } from 'lucide-react';

export default function EditArticlePage() {
  const params = useParams();
  const id = params?.id as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticle() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchArticleById(id);
        setArticle(data);
      } catch (err: any) {
        console.error('Error loading article for edit:', err);
        setError(err.message || 'கட்டுரையை ஏற்றுவதில் பிழை.');
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground font-tamil flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>கட்டுரை தரவுத்தளத்திலிருந்து ஏற்றப்படுகிறது...</span>
      </div>
    );
  }

  if (error || !article) {
    return (
      <EmptyState
        title="கட்டுரை கிடைக்கவில்லை"
        description="நீங்கள் கோரிய கட்டுரை ஐடி தரவுத்தளத்தில் இல்லை அல்லது நீக்கப்பட்டிருக்கலாம்."
        actionText="கட்டுரைகள் பட்டியலுக்குத் திரும்ப"
        actionHref="/admin/articles"
      />
    );
  }

  return <ArticleForm initialArticle={article} isEditing={true} />;
}
