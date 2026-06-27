'use client';

import { Bookmark, Heart } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ArticleBodyProps {
  content: any; // Tiptap JSON
  articleId: string;
  title: string;
  author: string;
}

export function ArticleBody({ content, articleId, title, author }: ArticleBodyProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Tiptap JSON-ஐ HTML-ஆக மாற்றும் எளிய செயல்பாடு (Simplified JSON to HTML)
  // நிஜமான பயன்பாட்டில் @tiptap/html பயன்படுத்தப்பட வேண்டும்
  const renderNode = (node: any) => {
    switch (node.type) {
      case 'paragraph':
        return <p className="mb-6 leading-[1.9] text-[16px] md:text-[18px] font-sans text-foreground/90">{node.content?.map(renderNode)}</p>;
      case 'text':
        return node.text;
      case 'heading':
        const level = node.attrs?.level || 2;
        const headingClass = "font-serif font-bold text-2xl md:text-3xl mt-10 mb-6 leading-tight";
        if (level === 1) return <h1 className={headingClass}>{node.content?.map(renderNode)}</h1>;
        if (level === 3) return <h3 className={headingClass}>{node.content?.map(renderNode)}</h3>;
        if (level === 4) return <h4 className={headingClass}>{node.content?.map(renderNode)}</h4>;
        if (level === 5) return <h5 className={headingClass}>{node.content?.map(renderNode)}</h5>;
        if (level === 6) return <h6 className={headingClass}>{node.content?.map(renderNode)}</h6>;
        return <h2 className={headingClass}>{node.content?.map(renderNode)}</h2>;
      default:
        return null;
    }
  };

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    // API அழைப்பு (API Call)
    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ articleId }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <article className="max-w-3xl mx-auto px-4 py-8 font-serif">
      <header className="mb-12 border-b pb-8">
        <div className="flex justify-between items-start gap-4 mb-4">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            {title}
          </h1>
          <button 
            onClick={handleBookmark}
            className={cn(
              "p-2 rounded-full transition-colors",
              isBookmarked ? "text-red-500 bg-red-50" : "text-muted-foreground hover:bg-accent"
            )}
            title="புத்தகக்குறி (Bookmark)"
          >
            <Heart className={cn("h-6 w-6", isBookmarked && "fill-current")} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="font-medium text-foreground">{author}</span>
          <span>•</span>
          <span>5 நிமிடம் வாசிப்பு</span>
        </div>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        {content?.content?.map((node: any, idx: number) => (
          <div key={idx}>{renderNode(node)}</div>
        ))}
      </div>
    </article>
  );
}
