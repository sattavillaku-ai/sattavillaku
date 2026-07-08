'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function SearchClient() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data.results || []);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[70vh]">
      <h1 className="text-3xl font-bold font-serif mb-8 text-center">தேடல் (Search)</h1>
      
      <div className="relative mb-12">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="கட்டுரைகள், ஆசிரியர்கள் அல்லது தலைப்புகளைத் தேடுங்கள்..."
          className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-primary/20 focus:border-primary focus:ring-0 text-lg transition-all"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="space-y-6">
        {results.length > 0 ? (
          results.map((result) => (
            <Link 
              key={result.id} 
              href={`/issues/${result.issue_slug}`}
              className="block p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold font-serif text-primary">
                  {result.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{result.author}</span>
                  <span>•</span>
                  <span>இதழ்: {result.issue_title}</span>
                </div>
                <p className="text-sm mt-2 font-medium italic">
                  {result.snippet}
                </p>
              </div>
            </Link>
          ))
        ) : query.trim() && !isLoading ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-xl">தேடல் முடிவுகள் இல்லை (No results found)</p>
            <p className="mt-2 text-sm">வேறு சொற்களைப் பயன்படுத்தித் தேடிப் பாருங்கள்.</p>
          </div>
        ) : !query.trim() && (
          <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl">
            <p className="font-serif italic text-lg">சிறந்த படைப்புகளைத் தேடத் தொடங்குங்கள்...</p>
          </div>
        )}
      </div>
    </div>
  );
}
