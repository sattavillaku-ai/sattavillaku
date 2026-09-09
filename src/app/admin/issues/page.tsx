'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, PlusCircle, Edit, Trash2, Eye, CheckCircle, Clock } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Issue } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import { formatDateTamil } from '@/lib/utils';

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    setIssues(dataService.getIssues());
  }, []);

  const handleTogglePublish = (issue: Issue) => {
    const updated: Issue = {
      ...issue,
      status: issue.status === 'published' ? 'draft' : 'published',
    };
    dataService.saveIssue(updated);
    setIssues(dataService.getIssues());
    setNotification(`இதழ் ${issue.issueNumber} நிலை மாற்றப்பட்டது.`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm('இந்த இதழை நிச்சயமாக நீக்க வேண்டுமா?')) {
      dataService.deleteIssue(id);
      setIssues(dataService.getIssues());
      setNotification('இதழ் வெற்றிகரமாக நீக்கப்பட்டது.');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold font-tamil text-foreground">
            மாத இதழ்கள் மேலாண்மை (Magazine Issues)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            அச்சு மற்றும் டிஜிட்டல் இதழ்களின் வெளியீடுகள், அட்டைப்படங்கள் மற்றும் PDF கோப்புகள்
          </p>
        </div>

        <Link
          href="/admin/issues/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>புதிய இதழ் உருவாக்கு (New Issue)</span>
        </Link>
      </div>

      {notification && (
        <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-tamil flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Issues Table */}
      <div className="bg-card border border-border rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-tamil divide-y divide-border">
            <thead className="bg-muted/50 text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5">அட்டைப்படம்</th>
                <th className="p-3.5">இதழ் எண் & தலைப்பு</th>
                <th className="p-3.5">மாதம் & ஆண்டு</th>
                <th className="p-3.5">பக்கங்கள்</th>
                <th className="p-3.5">நிலை (Status)</th>
                <th className="p-3.5 text-right">செயல்கள் (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5">
                    <img
                      src={issue.coverUrl}
                      alt={issue.title}
                      className="w-10 h-14 object-cover rounded-xs border border-border shadow-xs"
                    />
                  </td>
                  <td className="p-3.5 max-w-xs">
                    <div className="font-bold text-foreground line-clamp-1">
                      {issue.title}
                    </div>
                    <div className="text-[11px] text-primary font-semibold mt-0.5">
                      இதழ் எண்: {issue.issueNumber}
                    </div>
                  </td>
                  <td className="p-3.5 text-foreground whitespace-nowrap">
                    {issue.month} {issue.year}
                  </td>
                  <td className="p-3.5 text-muted-foreground whitespace-nowrap font-mono">
                    {issue.pageCount} பக்.
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <StatusBadge status={issue.status} />
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                    <Link
                      href={`/magazine/${issue.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-xs border border-border bg-card text-muted-foreground hover:text-primary hover:bg-muted inline-block"
                      title="முன்னோட்டம் (Preview)"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleTogglePublish(issue)}
                      className={`px-2 py-1 rounded-xs text-[11px] font-bold border transition-colors ${
                        issue.status === 'published'
                          ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                          : 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {issue.status === 'published' ? 'நிறுத்து (Unpublish)' : 'வெளியிடு (Publish)'}
                    </button>

                    <Link
                      href={`/admin/issues/${issue.id}`}
                      className="p-1.5 rounded-xs border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted inline-block"
                      title="திருத்து (Edit)"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(issue.id)}
                      className="p-1.5 rounded-xs border border-border bg-card text-destructive hover:bg-destructive/10 inline-block"
                      title="நீக்கு (Delete)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
