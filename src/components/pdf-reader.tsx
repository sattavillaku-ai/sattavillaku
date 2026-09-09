'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sidebar,
  Search,
  RotateCcw,
  BookOpen,
  FileText,
  Download,
  Share2,
  ListOrdered
} from 'lucide-react';
import { Issue } from '@/types';

interface PDFReaderProps {
  issue: Issue;
  initialPage?: number;
  className?: string;
}

export function PDFReader({ issue, initialPage = 1, className = '' }: PDFReaderProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showTOC, setShowTOC] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const readerContainerRef = useRef<HTMLDivElement>(null);

  const totalPages = issue.pageCount || 64;

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(200, prev + 15));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(70, prev - 15));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const toggleFullscreen = () => {
    if (!readerContainerRef.current) return;
    if (!document.fullscreenElement) {
      readerContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages]);

  // Page mock content generator according to page number
  const renderPageContent = (page: number) => {
    if (page === 1) {
      // Cover Page
      return (
        <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-12 text-white bg-linear-to-b from-stone-900 via-rose-950 to-stone-950">
          <div className="flex justify-between items-start border-b border-rose-500/40 pb-4">
            <div>
              <div className="text-3xl sm:text-5xl font-extrabold font-tamil tracking-tight text-rose-200">
                சட்டவிளக்கு
              </div>
              <div className="text-xs sm:text-sm uppercase tracking-widest text-stone-300 mt-1 font-sans">
                SATTAVILAKKU • LAW & EDITORIAL MONTHLY
              </div>
            </div>
            <div className="text-right">
              <span className="bg-primary text-primary-foreground font-bold px-3 py-1 rounded-xs text-xs sm:text-sm">
                இதழ் {issue.issueNumber}
              </span>
              <div className="text-xs text-stone-300 mt-1">{issue.month} {issue.year}</div>
            </div>
          </div>

          <div className="my-auto py-8 text-center space-y-4">
            <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-3 py-1 rounded-full font-semibold">
              சிறப்பிதழ் (Special Edition)
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-tamil leading-snug max-w-lg mx-auto text-rose-50">
              {issue.title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
              {issue.description}
            </p>
          </div>

          <div className="border-t border-rose-500/40 pt-4 flex items-center justify-between text-xs text-stone-300">
            <span>RNI: TN-TAM/2022/84920</span>
            <span className="font-semibold text-rose-300">விலை: ₹50</span>
            <span>சென்னை பதிப்பு</span>
          </div>
        </div>
      );
    }

    if (page === 2 || page === 3) {
      // Editorial / Contents Page
      return (
        <div className="w-full h-full p-6 sm:p-10 bg-[#fdfcf9] dark:bg-[#1a1c22] text-[#1c1917] dark:text-[#f3f4f6] flex flex-col justify-between">
          <div className="border-b-2 border-primary pb-3 flex justify-between items-center text-xs">
            <span className="font-bold font-tamil text-primary">சட்டவிளக்கு • இதழ் {issue.issueNumber}</span>
            <span className="text-muted-foreground">{issue.month} {issue.year}</span>
          </div>

          <div className="py-4 space-y-4 flex-1 overflow-y-auto">
            <div className="text-center pb-2">
              <h2 className="text-xl sm:text-2xl font-extrabold font-tamil text-primary">
                இதழின் பொருளடக்கம் (Table of Contents)
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                சட்டவிளக்கு செப்டம்பர் 2026 பிரத்யேக தொகுப்புகள்
              </p>
            </div>

            <div className="space-y-3 divide-y divide-border/60">
              {issue.tableOfContents.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPage(item.page)}
                  className="w-full text-left pt-2.5 flex items-start justify-between group hover:bg-muted/40 p-1.5 rounded-xs transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-primary uppercase">{item.category}</span>
                    <div className="text-sm font-bold font-tamil group-hover:text-primary transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground font-tamil">{item.author}</div>
                  </div>
                  <span className="text-sm font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-xs shrink-0 ml-2">
                    பக். {item.page}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-3 flex justify-between items-center text-[11px] text-muted-foreground">
            <span>பக்க எண்: {page}</span>
            <span>ஆசிரியர்: கே. எஸ். இளங்கோவன்</span>
          </div>
        </div>
      );
    }

    // Standard Inner Article Page (High Editorial Newspaper Layout)
    const matchingTOC = issue.tableOfContents.find(
      (t, i) => page >= t.page && (i === issue.tableOfContents.length - 1 || page < issue.tableOfContents[i + 1].page)
    );

    return (
      <div className="w-full h-full p-6 sm:p-10 bg-[#fdfcf9] dark:bg-[#1a1c22] text-[#1c1917] dark:text-[#f3f4f6] flex flex-col justify-between">
        {/* Header line */}
        <div className="border-b border-border pb-2.5 flex justify-between items-center text-[11px] text-muted-foreground">
          <span className="font-bold text-primary font-tamil">
            சட்டவிளக்கு • {matchingTOC?.category || 'சிறப்புக் கட்டுரை'}
          </span>
          <span className="italic">இதழ் {issue.issueNumber} ({issue.month} {issue.year})</span>
        </div>

        {/* Page Content Columns */}
        <div className="py-4 flex-1 overflow-y-auto space-y-4">
          <div className="space-y-1.5 border-b border-border/50 pb-3">
            <span className="text-xs font-bold text-primary uppercase">
              {matchingTOC?.category || 'சட்டம்'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-tamil leading-tight">
              {matchingTOC ? matchingTOC.title : `அரசியல் சாசனத்தின் 75 ஆண்டுகள்: சிறப்புப் பார்வை`}
            </h2>
            <div className="text-xs font-medium text-muted-foreground">
              கட்டுரையாளர்: <span className="text-foreground font-bold">{matchingTOC?.author || 'சட்டவிளக்கு ஆசிரியர் குழு'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm leading-relaxed font-tamil text-justify">
            <div className="space-y-3">
              <p>
                <span className="text-3xl float-left mr-2 font-bold text-primary leading-none">இ</span>
                ந்திய ஜனநாயகத்தின் மாபெரும் அச்சாணியாகத் திகழும் நமது அரசியல் சாசனம், சமத்துவத்தையும் தனிமனித சுதந்திரத்தையும் நிலைநிறுத்தும் உச்சபட்ச சாசனமாக விளங்குகிறது. 
              </p>
              <p>
                நீதிமன்றங்களின் தீர்ப்புகள் வெறும் சட்டம் சார்ந்தவை மட்டுமல்ல; அவை கோடிக்கணக்கான எளிய மக்களின் சமூக-பொருளாதார வாழ்வை மாற்றி அமைக்கும் வல்லமை படைத்தவை என்பதற்கு உச்ச நீதிமன்றத்தின் பல்வேறு அரசியல் சாசன அமர்வு தீர்ப்புகளே சான்றாகும்.
              </p>
              <div className="p-3 bg-muted/50 border-l-2 border-primary rounded-xs text-xs italic">
                &ldquo;சட்டம் என்பது ஆட்சியாளர்களின் கருவியல்ல; அது குடிமக்களின் உரிமைகளுக்கான கவசம்.&rdquo;
              </div>
            </div>

            <div className="space-y-3">
              <p>
                சமகால சூழலில் டிஜிட்டல் தொழில்நுட்ப வளர்ச்சி, தனிநபர் தரவுப் பாதுகாப்பு, மற்றும் இணையக் குற்றங்கள் பெருக்கம் ஆகியவை நீதித்துறைக்கு புதிய சவால்களை முன்னிறுத்தியுள்ளன.
              </p>
              <p>
                மாநில சுயாட்சி, நிதிப்பகிர்வு மற்றும் கூட்டாட்சி கட்டமைப்பு ஆகிய கோட்பாடுகளை பாதுகாப்பதில் உயர் நீதிமன்றங்களின் பங்கு மென்மேலும் முக்கியத்துவம் பெற்று வருகிறது.
              </p>
              <p>
                சென்னை உயர் நீதிமன்றம் தனது 160 ஆண்டுகால வரலாற்றில் சமூக நீதிக்காக ஆற்றியுள்ள பங்களிப்பு தெற்காசிய சட்ட வரலாற்றிலேயே தனித்துவமானது.
              </p>
            </div>
          </div>
        </div>

        {/* Footer line */}
        <div className="border-t border-border pt-2.5 flex justify-between items-center text-[11px] text-muted-foreground">
          <span>சட்டவிளக்கு - நடுநிலையான தமிழ்ச் சட்ட இதழ்</span>
          <span className="font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-xs">
            பக்கம் {page}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={readerContainerRef}
      className={`flex flex-col bg-stone-900 text-stone-100 rounded-lg overflow-hidden border border-stone-800 shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative min-h-[600px] h-[80vh]'
      } ${className}`}
    >
      {/* Top Toolbar */}
      <div className="bg-stone-950/90 border-b border-stone-800 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 z-10">
        {/* Left: Title & Sidebar toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-1.5 rounded-xs transition-colors ${
              showThumbnails
                ? 'bg-primary text-white'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
            title="பக்கக் காட்சியகம் (Thumbnails)"
          >
            <Sidebar className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowTOC(!showTOC)}
            className={`p-1.5 rounded-xs transition-colors hidden sm:inline-flex items-center gap-1 text-xs ${
              showTOC
                ? 'bg-primary text-white'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
            title="பொருளடக்கம் (TOC)"
          >
            <ListOrdered className="w-4 h-4" />
            <span>பொருளடக்கம்</span>
          </button>

          <div className="h-4 w-px bg-stone-800 hidden sm:block" />

          <div className="flex items-center gap-1 text-xs text-stone-300 truncate max-w-[200px] sm:max-w-xs">
            <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-bold truncate">{issue.title}</span>
          </div>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-md px-2 py-1 text-xs">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 rounded-xs hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent"
            title="முந்தைய பக்கம்"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono px-1">
            பக்கம் <span className="font-bold text-white">{currentPage}</span> / {totalPages}
          </span>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-1 rounded-xs hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent"
            title="அடுத்த பக்கம்"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Zoom & Fullscreen controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-md px-1 py-0.5 text-xs">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded-xs hover:bg-stone-800 text-stone-300 hover:text-white"
              title="பெரிதாக்கத்தைக் குறைக்கவும்"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1 text-stone-300 w-10 text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded-xs hover:bg-stone-800 text-stone-300 hover:text-white"
              title="பெரிதாக்கவும்"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 rounded-xs hover:bg-stone-800 text-stone-400 hover:text-white hidden sm:block"
              title="இயல்பு நிலைக்கு மீட்டமை"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
            title={isFullscreen ? 'முழுத்திரையிலிருந்து வெளியேற' : 'முழுத்திரை'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Reader Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Thumbnail Sidebar */}
        {showThumbnails && (
          <div className="w-36 sm:w-44 bg-stone-950 border-r border-stone-800 p-3 overflow-y-auto flex flex-col gap-3 shrink-0 z-10 animate-in slide-in-from-left duration-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
              பக்கங்கள் ({totalPages})
            </div>
            {Array.from({ length: Math.min(20, totalPages) }).map((_, idx) => {
              const p = idx + 1;
              const isSelected = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xs border text-left transition-all ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/40 bg-stone-900'
                      : 'border-stone-800 hover:border-stone-700 bg-stone-900/60'
                  }`}
                >
                  <div className="w-full aspect-3/4 bg-stone-800 rounded-xs flex items-center justify-center text-[10px] text-stone-400 font-mono overflow-hidden">
                    {p === 1 ? (
                      <img src={issue.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <span>பக். {p}</span>
                    )}
                  </div>
                  <span className={`text-[11px] ${isSelected ? 'font-bold text-primary' : 'text-stone-400'}`}>
                    பக்கம் {p}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Center Page Canvas */}
        <div className="flex-1 bg-stone-900/90 flex items-center justify-center p-4 sm:p-8 overflow-auto">
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full max-w-2xl aspect-1/1.414 bg-card rounded-md shadow-2xl overflow-hidden border border-stone-800 relative transition-all"
          >
            {renderPageContent(currentPage)}
          </div>
        </div>

        {/* Table of Contents Floating Drawer */}
        {showTOC && (
          <div className="absolute top-4 left-4 sm:left-48 max-w-sm w-full bg-stone-950 border border-stone-800 rounded-md shadow-2xl p-4 z-20 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-3">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5" />
                பொருளடக்கம்
              </span>
              <button
                type="button"
                onClick={() => setShowTOC(false)}
                className="text-stone-400 hover:text-white text-xs font-bold px-1"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {issue.tableOfContents.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentPage(item.page);
                    setShowTOC(false);
                  }}
                  className="w-full text-left p-2 rounded-xs hover:bg-stone-900 flex justify-between items-center text-xs transition-colors group"
                >
                  <span className="text-stone-200 group-hover:text-primary font-tamil truncate">
                    {item.title}
                  </span>
                  <span className="font-mono text-primary font-bold shrink-0 ml-2">
                    பக். {item.page}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-stone-950 border-t border-stone-800 px-4 py-2 flex items-center justify-between text-[11px] text-stone-400">
        <div className="flex items-center gap-2">
          <span>சட்டவிளக்கு டிஜிட்டல் வாசிப்பாளர் (PDF.js Architecture Ready)</span>
        </div>
        <div className="flex items-center gap-3">
          <span>விசைப்பலகை: ← முந்தைய பக்கம் | அடுத்த பக்கம் →</span>
        </div>
      </div>
    </div>
  );
}
