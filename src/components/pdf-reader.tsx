'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sidebar,
  RotateCcw,
  BookOpen,
  ListOrdered,
  Loader2,
  AlertCircle,
  FileX,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Issue } from '@/types';

interface PDFReaderProps {
  issue: Issue;
  initialPage?: number;
  className?: string;
}

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export function PDFReader({ issue, initialPage = 1, className = '' }: PDFReaderProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(issue.pageCount || 64);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [jumpPageInput, setJumpPageInput] = useState('');

  // Loading & Error States
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [isRenderingPage, setIsRenderingPage] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  const readerContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  // Session-based reading position preservation
  useEffect(() => {
    if (typeof window !== 'undefined' && issue.id) {
      const savedPage = sessionStorage.getItem(`sv_pdf_page_${issue.id}`);
      if (savedPage) {
        const p = parseInt(savedPage, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          setCurrentPage(p);
        }
      }
    }
  }, [issue.id, totalPages]);

  useEffect(() => {
    if (typeof window !== 'undefined' && issue.id && currentPage >= 1) {
      sessionStorage.setItem(`sv_pdf_page_${issue.id}`, currentPage.toString());
    }
  }, [issue.id, currentPage]);

  // 1. Fetch Signed URL if private storage path, or resolve direct URL
  useEffect(() => {
    let isMounted = true;

    async function resolveUrl() {
      setIsLoadingPdf(true);
      setPdfError(null);

      try {
        const rawPath = issue.pdf_url || issue.pdfUrl;

        if (!rawPath || !rawPath.trim()) {
          if (isMounted) {
            setPdfError('இவ்விதழுக்கான PDF ஆவணம் இன்னும் பதிவேற்றப்படவில்லை.');
            setIsLoadingPdf(false);
          }
          return;
        }

        // Direct HTTP URL or sample
        if (rawPath.startsWith('http://') || rawPath.startsWith('https://') || rawPath.startsWith('/')) {
          if (isMounted) setResolvedPdfUrl(rawPath);
          return;
        }

        // Private storage path: generate signed URL via server route
        const res = await fetch(`/api/magazine/pdf-url?slug=${encodeURIComponent(issue.slug)}`);
        const data = await res.json();

        if (!res.ok || !data.url) {
          throw new Error(data.error || 'PDF ஆவணத்தைப் பெற முடியவில்லை.');
        }

        if (isMounted) {
          setResolvedPdfUrl(data.url);
          if (data.pageCount && data.pageCount > 0) {
            setTotalPages(data.pageCount);
          }
        }
      } catch (err: any) {
        console.error('Error resolving PDF URL:', err);
        if (isMounted) {
          setPdfError(err.message || 'PDF ஆவணத்தை ஏற்றுவதில் பிழை ஏற்பட்டது.');
          setIsLoadingPdf(false);
        }
      }
    }

    resolveUrl();

    return () => {
      isMounted = false;
    };
  }, [issue.slug, issue.pdf_url, issue.pdfUrl]);

  // 2. Load PDF.js library via script tag if not already available
  const loadPdfJsScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.pdfjsLib) {
        resolve();
        return;
      }

      const existingScript = document.querySelector(`script[src="${PDFJS_CDN}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('PDF.js script load failed')));
        return;
      }

      const script = document.createElement('script');
      script.src = PDFJS_CDN;
      script.async = true;
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
          resolve();
        } else {
          reject(new Error('PDF.js library missing on window'));
        }
      };
      script.onerror = () => reject(new Error('PDF.js CDN load error'));
      document.body.appendChild(script);
    });
  }, []);

  // 3. Load PDF Document once URL is resolved
  useEffect(() => {
    let isCancelled = false;

    if (!resolvedPdfUrl) return;

    async function loadDocument() {
      try {
        setIsLoadingPdf(true);
        setPdfError(null);

        await loadPdfJsScript();

        if (isCancelled) return;

        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;

        const loadingTask = window.pdfjsLib.getDocument({
          url: resolvedPdfUrl,
          withCredentials: false,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;

        if (isCancelled) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setIsLoadingPdf(false);
      } catch (err: any) {
        console.error('PDF Document load error:', err);
        if (!isCancelled) {
          setPdfError('PDF ஆவணத்தை ஏற்ற முடியவில்லை. பிணைய இணைப்பை சரிபார்க்கவும்.');
          setIsLoadingPdf(false);
        }
      }
    }

    loadDocument();

    return () => {
      isCancelled = true;
    };
  }, [resolvedPdfUrl, loadPdfJsScript]);

  // 4. Render Active Page on Canvas
  useEffect(() => {
    let isCancelled = false;

    if (!pdfDoc || !canvasRef.current) return;

    async function renderPage() {
      try {
        setIsRenderingPage(true);

        // Cancel previous render task if still in progress
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // ignore cancel abort
          }
        }

        const page = await pdfDoc.getPage(currentPage);

        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Compute viewport scale
        const baseScale = 1.6;
        const scale = (baseScale * zoomLevel) / 100;
        const viewport = page.getViewport({ scale });

        // Adjust for device pixel ratio for sharp text rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;

        await task.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Page render error:', err);
        }
      } finally {
        if (!isCancelled) {
          setIsRenderingPage(false);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDoc, currentPage, zoomLevel]);

  // Page Controls
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      setJumpPageInput('');
    }
  };

  // Zoom Controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(220, prev + 15));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(60, prev - 15));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!readerContainerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        readerContainerRef.current.requestFullscreen?.().catch(() => {});
        setIsFullscreen(true);
      } else {
        document.exitFullscreen?.().catch(() => {});
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard Navigation: Left arrow / Right arrow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages]);

  return (
    <div
      ref={readerContainerRef}
      className={`flex flex-col bg-stone-900 text-stone-100 rounded-lg overflow-hidden border border-stone-800 shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'relative min-h-[620px] h-[85vh]'
      } ${className}`}
    >
      {/* Top Toolbar */}
      <div className="bg-stone-950/95 border-b border-stone-800 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 z-10 select-none">
        {/* Left: Controls & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={`/magazine/${issue.slug}`}
            className="p-1.5 rounded-xs text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="இதழ் விவரப் பக்கத்திற்குத் திரும்புக"
            aria-label="இதழ் விவரப் பக்கத்திற்குத் திரும்புக"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-1.5 rounded-xs transition-colors cursor-pointer ${
              showThumbnails
                ? 'bg-primary text-primary-foreground'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
            title="பக்கக் காட்சியகம் (Thumbnails)"
            aria-label="பக்கக் காட்சியகம்"
            aria-expanded={showThumbnails}
          >
            <Sidebar className="w-4 h-4" />
          </button>

          {issue.tableOfContents && issue.tableOfContents.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTOC(!showTOC)}
              className={`p-1.5 rounded-xs transition-colors cursor-pointer hidden sm:inline-flex items-center gap-1 text-xs font-semibold ${
                showTOC
                  ? 'bg-primary text-primary-foreground'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
              title="பொருளடக்கம் (TOC)"
              aria-label="பொருளடக்கம் பட்டியல்"
              aria-expanded={showTOC}
            >
              <ListOrdered className="w-4 h-4" />
              <span>பொருளடக்கம்</span>
            </button>
          )}

          <div className="h-4 w-px bg-stone-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-xs text-stone-300 truncate max-w-[180px] sm:max-w-sm">
            <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-bold truncate font-tamil">{issue.title}</span>
          </div>
        </div>

        {/* Center: Page Controls & Jump */}
        <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-md px-2 py-1 text-xs">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 rounded-xs hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
            title="முந்தைய பக்கம் (←)"
            aria-label="முந்தைய பக்கம்"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <form onSubmit={handleJumpToPage} className="flex items-center gap-1">
            <input
              type="text"
              value={jumpPageInput}
              placeholder={currentPage.toString()}
              onChange={(e) => setJumpPageInput(e.target.value)}
              className="w-10 text-center bg-stone-950 border border-stone-800 rounded-xs py-0.5 text-xs font-mono text-white focus:outline-none focus:border-primary"
              title="பக்க எண்ணை உள்ளிட்டு Enter அழுத்தவும்"
              aria-label="பக்க எண்"
            />
            <span className="text-stone-400 font-mono">/ {totalPages}</span>
          </form>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-1 rounded-xs hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
            title="அடுத்த பக்கம் (→)"
            aria-label="அடுத்த பக்கம்"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Zoom & Fullscreen controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-md px-1.5 py-0.5 text-xs">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded-xs hover:bg-stone-800 text-stone-300 hover:text-white cursor-pointer"
              title="பெரிதாக்கத்தைக் குறைக்கவும்"
              aria-label="பெரிதாக்கத்தைக் குறைக்கவும்"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1 text-stone-300 w-11 text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded-xs hover:bg-stone-800 text-stone-300 hover:text-white cursor-pointer"
              title="பெரிதாக்கவும்"
              aria-label="பெரிதாக்கவும்"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 rounded-xs hover:bg-stone-800 text-stone-400 hover:text-white hidden sm:block cursor-pointer"
              title="100% மீட்டமை"
              aria-label="அளவை மீட்டமைக்கவும்"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'முழுத்திரையிலிருந்து வெளியேற' : 'முழுத்திரை'}
            aria-label={isFullscreen ? 'முழுத்திரையிலிருந்து வெளியேறவும்' : 'முழுத்திரையாகக் காட்டவும்'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Reader Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Thumbnail Sidebar */}
        {showThumbnails && (
          <div className="w-36 sm:w-44 bg-stone-950 border-r border-stone-800 p-3 overflow-y-auto flex flex-col gap-3 shrink-0 z-10 animate-in slide-in-from-left duration-200 select-none">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
              பக்கங்கள் ({totalPages})
            </div>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              const isSelected = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`flex flex-col items-center gap-1 p-1 rounded-xs border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/40 bg-stone-900'
                      : 'border-stone-800 hover:border-stone-700 bg-stone-900/60'
                  }`}
                >
                  <div className="w-full aspect-3/4 bg-stone-800 rounded-xs flex items-center justify-center text-[10px] text-stone-400 font-mono overflow-hidden">
                    {p === 1 && issue.coverUrl ? (
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

        {/* Center Page Canvas Area */}
        <div className="flex-1 bg-stone-900/90 flex flex-col items-center justify-start p-4 sm:p-8 overflow-auto relative">
          {isLoadingPdf && (
            <div className="my-auto flex flex-col items-center justify-center gap-3 text-stone-400 py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <div className="text-sm font-tamil">டிஜிட்டல் இதழ் ஏற்றப்படுகிறது...</div>
            </div>
          )}

          {pdfError && !isLoadingPdf && (
            <div className="my-auto max-w-md bg-stone-950 border border-stone-800 rounded-lg p-6 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <FileX className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-tamil">
                PDF ஆவணம் தற்போது கிடைக்கவில்லை
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed font-tamil">
                {pdfError}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  மீண்டும் முயற்சிக்கவும் (Retry)
                </button>
              </div>
            </div>
          )}

          {/* Canvas for PDF.js Rendering */}
          <div
            className={`shadow-2xl rounded-xs overflow-hidden border border-stone-800 bg-white transition-opacity duration-200 ${
              isLoadingPdf || pdfError ? 'hidden' : 'block'
            }`}
          >
            <canvas ref={canvasRef} className="block mx-auto max-w-full h-auto" />
          </div>

          {/* Rendering Spinner Overlay */}
          {isRenderingPage && !isLoadingPdf && (
            <div className="absolute top-6 right-6 bg-stone-950/80 text-stone-300 px-3 py-1 rounded-full text-xs flex items-center gap-2 border border-stone-800 shadow-md">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>பக்கம் தயாராகிறது...</span>
            </div>
          )}
        </div>

        {/* Table of Contents Floating Drawer */}
        {showTOC && issue.tableOfContents && issue.tableOfContents.length > 0 && (
          <div className="absolute top-4 left-4 sm:left-48 max-w-sm w-full bg-stone-950 border border-stone-800 rounded-md shadow-2xl p-4 z-20 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-3">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5" />
                பொருளடக்கம்
              </span>
              <button
                type="button"
                onClick={() => setShowTOC(false)}
                className="text-stone-400 hover:text-white text-xs font-bold px-1 cursor-pointer"
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
                  className="w-full text-left p-2 rounded-xs hover:bg-stone-900 flex justify-between items-center text-xs transition-colors group cursor-pointer"
                >
                  <div className="truncate mr-2">
                    <div className="text-stone-200 group-hover:text-primary font-tamil truncate">
                      {item.title}
                    </div>
                    {item.author && (
                      <div className="text-[10px] text-stone-400 truncate">{item.author}</div>
                    )}
                  </div>
                  <span className="font-mono text-primary font-bold shrink-0">
                    பக். {item.page}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-stone-950 border-t border-stone-800 px-4 py-2 flex items-center justify-between text-[11px] text-stone-400 select-none">
        <div className="flex items-center gap-2">
          <span>சட்டவிளக்கு டிஜிட்டல் மாத இதழ் • இதழ் {issue.issueNumber} ({issue.month} {issue.year})</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-primary font-semibold">
            {Math.round((currentPage / (totalPages || 1)) * 100)}% வாசிக்கப்பட்டது
          </span>
          <span className="hidden sm:inline text-stone-700">|</span>
          <span className="hidden sm:inline">விசைப்பலகை: ← முந்தைய பக்கம் | அடுத்த பக்கம் →</span>
        </div>
      </div>
    </div>
  );
}
