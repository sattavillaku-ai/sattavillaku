/**
 * Content Sanitizer for Sattavilakku Rich Text & HTML
 *
 * Enforces XSS defense against:
 * - Script injections (<script>, <iframe>, <object>, etc.)
 * - Inline event handlers (onload, onerror, onclick, etc.)
 * - javascript: / vbscript: pseudo-protocol URLs
 */

export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  let sanitized = rawHtml;

  // 1. Remove dangerous executable tags and contents
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<applet\b[^>]*>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');

  // 2. Strip inline DOM event handlers (e.g. onload=, onerror=, onclick=)
  sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 3. Neutralize javascript: and vbscript: URIs in attributes
  sanitized = sanitized.replace(
    /(href|src|action)\s*=\s*(['"]?)\s*(?:javascript|vbscript):[^'">\s]+/gi,
    '$1=$2#'
  );

  return sanitized;
}

/**
 * Strips all HTML tags to produce pure plain text (e.g. for excerpts, SEO descriptions)
 */
export function stripHtmlToText(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
