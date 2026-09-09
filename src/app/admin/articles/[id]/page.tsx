'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { dataService } from '@/lib/data-service';
import { Article } from '@/types';
import { ArticleForm } from '@/components/admin/article-form';
import { EmptyState } from '@/components/empty-state';

export default function EditArticlePage() {
  const params = useParams();
  const id = params?.id as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const found = dataService.getArticleById(id) || dataService.getArticles()[0];
      setArticle(found || null);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-tamil">ஏற்றப்படுகிறது...</div>;
  }

  if (!article) {
    return (
      <EmptyState
        title="கட்டுரை கிடைக்கவில்லை"
        description="நீங்கள் கோரிய கட்டுரை ஐடி தரவுத்தளத்தில் இல்லை."
        actionText="கட்டுரைகள் பட்டியலுக்குத் திரும்ப"
        actionHref="/admin/articles"
      />
    );
  }

  return <ArticleForm initialArticle={article} isEditing={true} />;
}
