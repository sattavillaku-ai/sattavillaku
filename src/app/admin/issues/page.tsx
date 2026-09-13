'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Search,
  Filter,
  FileCheck,
  FileX,
  Archive,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Issue, IssueStatus } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import { formatDateTamil } from '@/lib/utils';
import {
  fetchIssues,
  toggleIssuePublish,
  archiveIssue,
  deleteIssue,
} from '@/lib/cms-service';

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadIssues = async () => {
    try {
      setLoading(true);
      const data = await fetchIssues({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        year: yearFilter !== 'all' ? Number(yearFilter) : undefined,
        search: searchQuery.trim() || undefined,
      });
      setIssues(data);
    } catch (err: any) {
      console.error('Error loading issues:', err);
      showNotification('இதழ்களை ஏற்றுவதில் பிழை ஏற்பட்டது.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [statusFilter, yearFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadIssues();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleTogglePublish = async (issue: Issue) => {
    try {
      const newStatus = await toggleIssuePublish(issue.id, issue.status);
      setIssues((prev) =>
        prev.map((i) =>
          i.id === issue.id
            ? {
                ...i,
                status: newStatus,
                published_at: newStatus === 'published' ? new Date().toISOString() : i.published_at,
              }
            : i
        )
      );
      showNotification(
        newStatus === 'published'
          ? `இதழ் ${issue.issueNumber} பொதுப்பார்வைக்கு வெளியிடப்பட்டது.`
          : `இதழ் ${issue.issueNumber} வரைவு நிலைக்கு மாற்றப்பட்டது.`
      );
    } catch (err: any) {
      showNotification(err.message || 'இதழ் நிலையை மாற்ற முடியவில்லை.', 'error');
    }
  };

  const handleArchive = async (issue: Issue) => {
    if (!confirm(`இதழ் எண் ${issue.issueNumber}-ஐ காப்பகப்படுத்த (Archive) விரும்புகிறீர்களா?`)) {
      return;
    }

    try {
      await archiveIssue(issue.id);
      setIssues((prev) =>
        prev.map((i) => (i.id === issue.id ? { ...i, status: 'archived' } : i))
      );
      showNotification(`இதழ் ${issue.issueNumber} காப்பகப்படுத்தப்பட்டது.`);
    } catch (err: any) {
      showNotification(err.message || 'இதழைக் காப்பகப்படுத்த முடியவில்லை.', 'error');
    }
  };

  const handleDelete = async (issue: Issue) => {
    if (!confirm(`எச்சரிக்கை: இதழ் "${issue.title}" (இதழ் ${issue.issueNumber})-ஐ நிச்சயமாக நீக்க வேண்டுமா?`)) {
      return;
    }

    try {
      setDeletingId(issue.id);
      await deleteIssue(issue.id);
      setIssues((prev) => prev.filter((i) => i.id !== issue.id));
      showNotification(`இதழ் வெற்றிகரமாக நீக்கப்பட்டது.`);
    } catch (err: any) {
      showNotification(err.message || 'இதழை நீக்க முடியவில்லை.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const availableYears = Array.from(
    new Set(issues.map((i) => i.year).filter(Boolean))
  ).sort((a, b) => b - a);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-tamil pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Supabase CMS</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            மாத இதழ்கள் மேலாண்மை (Magazine Issues)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            அச்சு மற்றும் டிஜிட்டல் மாத இதழ்கள், அட்டைப்படங்கள் மற்றும் தனிப்பட்ட Supabase PDF சேமிப்பகம்
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
        <div
          className={`p-3 rounded-md border text-xs font-tamil flex items-center gap-2 animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-lg p-3.5 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="தலைப்பு அல்லது இதழ் எண் மூலம் தேடுங்கள்..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-[11px] font-semibold">நிலை:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">அனைத்தும்</option>
              <option value="published">வெளியிடப்பட்டது (Published)</option>
              <option value="draft">வரைவு (Draft)</option>
              <option value="archived">காப்பகம் (Archived)</option>
            </select>
          </div>

          {/* Year Filter */}
          {availableYears.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-[11px] font-semibold">ஆண்டு:</span>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              >
                <option value="all">அனைத்தும்</option>
                {availableYears.map((y) => (
                  <option key={y} value={y.toString()}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-card border border-border rounded-lg shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">இதழ்கள் ஏற்றப்படுகின்றன...</span>
          </div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs">
            இதழ்கள் எதுவும் கிடைக்கவில்லை. புதிய இதழை உருவாக்க &quot;புதிய இதழ் உருவாக்கு&quot; பொத்தானை அழுத்தவும்.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-tamil divide-y divide-border">
              <thead className="bg-muted/50 text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3.5">அட்டைப்படம்</th>
                  <th className="p-3.5">தொகுதி & இதழ் எண்</th>
                  <th className="p-3.5">தலைப்பு & காலம்</th>
                  <th className="p-3.5">பக்கங்கள்</th>
                  <th className="p-3.5">PDF நிலை</th>
                  <th className="p-3.5">நிலை (Status)</th>
                  <th className="p-3.5">வெளியீட்டுத் தேதி</th>
                  <th className="p-3.5 text-right">செயல்கள் (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {issues.map((issue) => {
                  const hasPdf = Boolean(issue.pdf_url || issue.pdfUrl);
                  return (
                    <tr key={issue.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5">
                        <div className="w-11 h-15 rounded-xs overflow-hidden border border-border bg-muted shrink-0 shadow-2xs">
                          <img
                            src={issue.coverUrl}
                            alt={issue.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-mono">
                        <div className="font-bold text-primary text-sm">
                          இதழ் {issue.issueNumber}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          தொகுதி {issue.volume_number || 1}
                        </div>
                      </td>

                      <td className="p-3.5 max-w-sm">
                        <div className="font-bold text-foreground line-clamp-1 text-sm">
                          {issue.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {issue.month} {issue.year}
                        </div>
                      </td>

                      <td className="p-3.5 text-foreground whitespace-nowrap font-mono">
                        {issue.pageCount} பக்.
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {hasPdf ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold"
                            title={issue.pdf_url || ''}
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>இணைக்கப்பட்டுள்ளது</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                            <FileX className="w-3.5 h-3.5" />
                            <span>இல்லை</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <StatusBadge status={issue.status} />
                      </td>

                      <td className="p-3.5 text-muted-foreground whitespace-nowrap text-[11px]">
                        {issue.published_at ? formatDateTamil(issue.published_at) : '—'}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                        {/* Preview in reader */}
                        <Link
                          href={`/magazine/${issue.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-xs border border-border bg-card text-muted-foreground hover:text-primary hover:bg-muted inline-block cursor-pointer"
                          title="முன்னோட்டம் (Preview)"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {/* Publish / Draft toggle */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(issue)}
                          className={`px-2 py-1 rounded-xs text-[11px] font-bold border transition-colors cursor-pointer ${
                            issue.status === 'published'
                              ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                              : 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          {issue.status === 'published' ? 'நிறுத்து' : 'வெளியிடு'}
                        </button>

                        {/* Archive */}
                        {issue.status !== 'archived' && (
                          <button
                            type="button"
                            onClick={() => handleArchive(issue)}
                            className="p-1.5 rounded-xs border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted inline-block cursor-pointer"
                            title="காப்பகப்படுத்து (Archive)"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit */}
                        <Link
                          href={`/admin/issues/${issue.id}`}
                          className="p-1.5 rounded-xs border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted inline-block cursor-pointer"
                          title="திருத்து (Edit)"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete */}
                        <button
                          type="button"
                          disabled={deletingId === issue.id}
                          onClick={() => handleDelete(issue)}
                          className="p-1.5 rounded-xs border border-border bg-card text-destructive hover:bg-destructive/10 inline-block cursor-pointer disabled:opacity-50"
                          title="நீக்கு (Delete)"
                        >
                          {deletingId === issue.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
