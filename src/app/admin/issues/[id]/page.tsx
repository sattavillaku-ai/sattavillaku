'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Issue } from '@/types';
import { fetchIssueById } from '@/lib/cms-service';
import { IssueForm } from '@/components/admin/issue-form';
import { EmptyState } from '@/components/empty-state';
import { Loader2 } from 'lucide-react';

export default function EditIssuePage() {
  const params = useParams();
  const id = params?.id as string;
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const found = await fetchIssueById(id);
        if (isMounted) {
          setIssue(found);
        }
      } catch (err) {
        console.error('Error fetching issue:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3 text-muted-foreground font-tamil">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-xs">இதழ் விவரங்கள் ஏற்றப்படுகின்றன...</span>
      </div>
    );
  }

  if (!issue) {
    return (
      <EmptyState
        title="இதழ் காணப்படவில்லை"
        description="நீங்கள் கோரிய இதழ் ஐடி தரவுத்தளத்தில் இல்லை அல்லது நீக்கப்பட்டுவிட்டது."
        actionText="இதழ்கள் பட்டியலுக்குத் திரும்ப"
        actionHref="/admin/issues"
      />
    );
  }

  return <IssueForm initialIssue={issue} isEditing={true} />;
}
