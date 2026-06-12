import Image from 'next/image';
import Link from 'next/link';
import { Database } from '@/types/database.types';

type Issue = Database['public']['Tables']['issues']['Row'];

interface IssueCardProps {
  issue: Issue;
  isLoading?: boolean;
}

// தமிழ் எண்கள் (Tamil Numerals)
const toTamilNumerals = (num: number) => {
  const tamilDigits = ['௦', '௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯'];
  return num.toString().split('').map(digit => tamilDigits[parseInt(digit)]).join('');
};

export function IssueCard({ issue, isLoading }: IssueCardProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-card rounded-xl overflow-hidden border animate-pulse">
        <div className="aspect-[3/4] bg-muted" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <Link 
      href={`/issues/${issue.slug}`} 
      className="group flex flex-col h-full bg-card rounded-xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 active:scale-[0.98] min-h-[44px]"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={issue.cover_image_url || '/placeholder-cover.jpg'}
          alt={issue.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {issue.is_free ? (
            <span className="bg-green-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">இலவசம்</span>
          ) : (
            <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">சந்தா</span>
          )}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3 font-bold uppercase tracking-wider">
          <span className="bg-muted px-2 py-0.5 rounded">தொகுதி {toTamilNumerals(issue.volume_number || 1)}</span>
          <span className="bg-muted px-2 py-0.5 rounded">இதழ் {toTamilNumerals(issue.issue_number || 1)}</span>
        </div>
        
        <h3 className="font-serif font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          {issue.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-grow leading-relaxed">
          {issue.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">சட்டம்</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">அரசியல்</span>
        </div>
        
        <div className="text-[11px] text-muted-foreground border-t pt-3 mt-auto flex justify-between items-center italic">
          <span>{new Date(issue.published_at!).toLocaleDateString('ta-IN', { month: 'long', year: 'numeric' })}</span>
          <span className="font-sans not-italic font-bold text-primary">படிக்க →</span>
        </div>
      </div>
    </Link>
  );
}
