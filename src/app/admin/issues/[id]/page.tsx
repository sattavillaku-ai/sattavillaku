'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { dataService } from '@/lib/data-service';
import { Issue } from '@/types';
import { IssueForm } from '@/components/admin/issue-form';
import { EmptyState } from '@/components/empty-state';

export default function EditIssuePage() {
  const params = useParams();
  const id = params?.id as string;
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const found = dataService.getIssueById(id) || dataService.getIssues()[0];
      setIssue(found || null);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-tamil">ஏற்றப்படுகிறது...</div>;
  }

  if (!issue) {
    return (
      <EmptyState
        title="இதழ் காணப்படவில்லை"
        description="நீங்கள் கோரிய இதழ் ஐடி தரவுத்தளத்தில் இல்லை."
        actionText="இதழ்கள் பட்டியலுக்குத் திரும்ப"
        actionHref="/admin/issues"
      />
    );
  }

  return <IssueForm initialIssue={issue} isEditing={true} />;
}
