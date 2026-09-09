'use client';

import React from 'react';
import { ArticleForm } from '@/components/admin/article-form';

export default function NewArticlePage() {
  return <ArticleForm isEditing={false} />;
}
