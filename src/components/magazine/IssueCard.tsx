import Image from 'next/image';
import Link from 'next/link';
import { Database } from '@/types/database.types';
import { BookOpen, Calendar, ArrowUpRight } from 'lucide-react';

type Issue = Database['public']['Tables']['issues']['Row'];

interface IssueCardProps {
  issue: Issue;
  isLoading?: boolean;
}

export function IssueCard({ issue, isLoading }: IssueCardProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-card rounded-[2rem] overflow-hidden border border-border animate-pulse">
        <div className="aspect-[3/4] bg-muted" />
        <div className="p-8 space-y-4">
          <div className="h-4 bg-muted rounded-full w-1/4" />
          <div className="h-8 bg-muted rounded-full w-3/4" />
          <div className="h-20 bg-muted rounded-2xl w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col h-full bg-card rounded-[2rem] overflow-hidden border border-border hover:border-primary/50 hover:shadow-2xl transition-all duration-500 magazine-shadow active:scale-[0.98]">
      <Link href={`/issues/${issue.slug}`} className="relative aspect-[3/4] overflow-hidden block">
        <Image
          src={issue.cover_image_url || '/placeholder-cover.jpg'}
          alt={issue.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.95] group-hover:brightness-100"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-3">
          {!issue.is_free ? (
            <div className="bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              PREMIUM
            </div>
          ) : (
            <div className="bg-secondary text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl shadow-2xl">
              FREE ARCHIVE
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
          <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl rotate-12 group-hover:rotate-0 transition-transform">
            <ArrowUpRight size={28} />
          </div>
        </div>
      </Link>
      
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 bg-primary/5 w-fit px-3 py-1.5 rounded-lg">
          <Calendar size={12} />
          <span>{new Date(issue.published_at!).toLocaleDateString('ta-IN', { month: 'long', year: 'numeric' })}</span>
        </div>
        
        <Link href={`/issues/${issue.slug}`}>
          <h3 className="font-serif font-black text-2xl mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {issue.title}
          </h3>
        </Link>
        
        <p className="text-muted-foreground font-medium text-sm line-clamp-3 mb-8 flex-grow leading-relaxed">
          {issue.description}
        </p>
        
        <div className="border-t border-border pt-6 flex items-center justify-between">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">
                {i}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-card bg-primary flex items-center justify-center text-[8px] font-black text-white">
              +5
            </div>
          </div>
          
          <Link href={`/issues/${issue.slug}`} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground hover:text-primary transition-colors">
            வாசிக்க
            <BookOpen size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
