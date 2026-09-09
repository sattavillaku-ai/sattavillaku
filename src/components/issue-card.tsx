import React from 'react';
import Link from 'next/link';
import { BookOpen, ListOrdered, Calendar, ArrowRight } from 'lucide-react';
import { Issue } from '@/types';

interface IssueCardProps {
  issue: Issue;
  featured?: boolean;
  className?: string;
}

export function IssueCard({ issue, featured = false, className = '' }: IssueCardProps) {
  if (featured) {
    return (
      <div
        className={`group bg-card border border-border rounded-lg p-6 lg:p-8 shadow-xs hover:border-primary/50 transition-all ${className}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Magazine Cover */}
          <div className="md:col-span-5 lg:col-span-4 flex justify-center">
            <div className="relative w-56 sm:w-64 aspect-3/4 rounded-md overflow-hidden shadow-xl border border-border group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1">
              <img
                src={issue.coverUrl}
                alt={issue.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 right-2.5 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-xs shadow-md">
                இதழ் {issue.issueNumber}
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white text-xs">
                <div className="font-bold">{issue.month} {issue.year}</div>
                <div className="text-[11px] text-zinc-300">{issue.pageCount} பக்கங்கள் • முழு வண்ண இதழ்</div>
              </div>
            </div>
          </div>

          {/* Magazine Details */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xs bg-primary/10 text-primary text-xs font-bold mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>மாத இதழ் • {issue.month} {issue.year}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold font-tamil text-foreground leading-tight group-hover:text-primary transition-colors">
                <Link href={`/magazine/${issue.slug}`}>{issue.title}</Link>
              </h2>

              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-tamil mt-3">
                {issue.description}
              </p>
            </div>

            {/* Quick Table of Contents Preview */}
            {issue.tableOfContents && issue.tableOfContents.length > 0 && (
              <div className="bg-muted/40 rounded-md p-4 border border-border/80">
                <div className="text-xs font-bold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-primary" />
                  <span>இதழின் முக்கிய உள்ளடக்கங்கள்:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {issue.tableOfContents.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 truncate">
                      <span className="font-semibold text-primary shrink-0">பக்.{item.page}:</span>
                      <span className="truncate text-foreground font-tamil">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={`/magazine/${issue.slug}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-xs"
              >
                <BookOpen className="w-4 h-4" />
                <span>இதழைப் படிக்க (Read Issue)</span>
              </Link>

              <Link
                href="/magazine/current"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors"
              >
                <ListOrdered className="w-4 h-4 text-muted-foreground" />
                <span>உள்ளடக்கத்தைப் பார்க்க</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard issue card for archive/grids
  return (
    <div
      className={`group flex flex-col bg-card border border-border rounded-md overflow-hidden p-4 hover:border-primary/50 transition-all shadow-2xs hover:shadow-xs ${className}`}
    >
      <div className="relative aspect-3/4 rounded-xs overflow-hidden bg-muted mb-3.5 shadow-sm group-hover:shadow-md transition-shadow">
        <img
          src={issue.coverUrl}
          alt={issue.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-xs">
          இதழ் {issue.issueNumber}
        </div>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 text-white text-[11px]">
          <span className="font-bold">{issue.month} {issue.year}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold font-tamil leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
            <Link href={`/magazine/${issue.slug}`}>{issue.title}</Link>
          </h3>
          <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed font-tamil">
            {issue.description}
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-border/70 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{issue.pageCount} பக்கங்கள்</span>
          <Link
            href={`/magazine/${issue.slug}`}
            className="text-primary font-bold hover:underline flex items-center gap-1"
          >
            <span>படிக்க</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
