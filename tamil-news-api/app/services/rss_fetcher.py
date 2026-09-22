import logging
import urllib.parse
import urllib.request
import re
import html
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import feedparser
from dateutil import parser as date_parser
from bs4 import BeautifulSoup

logger = logging.getLogger("tamil_news.rss_fetcher")

# Browser-like User-Agent to avoid Google News rate-limiting or anti-bot drops
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"


def build_google_news_url(query: str) -> str:
    """Builds a URL-encoded Google News RSS search URL for Tamil language (hl=ta&gl=IN&ceid=IN:ta)."""
    encoded_query = urllib.parse.quote_plus(query.strip())
    return f"https://news.google.com/rss/search?q={encoded_query}&hl=ta&gl=IN&ceid=IN:ta"


def clean_html_text(raw_html: str) -> str:
    """Strips HTML tags, decodes HTML entities, and removes extra whitespace."""
    if not raw_html:
        return ""
    soup = BeautifulSoup(raw_html, "html.parser")
    # Remove script and style tags
    for tag in soup(["script", "style"]):
        tag.decompose()
    text = soup.get_text(separator=" ", strip=True)
    text = html.unescape(text)
    # Clean duplicate spaces
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_source_and_title(raw_title: str, entry_source: Optional[str] = None) -> tuple[str, str]:
    """Splits headline and publisher if title format is 'Headline - Publisher Name'.
    Preserves original title if no separator is found.
    """
    clean_t = html.unescape(raw_title or "").strip()
    source = (entry_source or "").strip()

    if " - " in clean_t:
        parts = clean_t.rsplit(" - ", 1)
        headline = parts[0].strip()
        extracted_source = parts[1].strip()
        if not source:
            source = extracted_source
        return headline, source

    return clean_t, source or "Google News (Tamil)"


def parse_publication_date(date_str: Optional[str]) -> Optional[str]:
    """Parses publication date string into timezone-aware ISO 8601 UTC string."""
    if not date_str:
        return datetime.now(timezone.utc).isoformat()
    try:
        dt = date_parser.parse(date_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        return dt.isoformat()
    except Exception:
        return datetime.now(timezone.utc).isoformat()


def extract_image_url(entry: Any) -> Optional[str]:
    """Extracts article image URL from media tags, enclosures, or summary HTML."""
    # 1. Check media_content
    if hasattr(entry, "media_content") and entry.media_content:
        for media in entry.media_content:
            if isinstance(media, dict) and "url" in media:
                return media["url"]

    # 2. Check media_thumbnail
    if hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
        for thumb in entry.media_thumbnail:
            if isinstance(thumb, dict) and "url" in thumb:
                return thumb["url"]

    # 3. Check enclosures
    if hasattr(entry, "enclosures") and entry.enclosures:
        for enc in entry.enclosures:
            if isinstance(enc, dict) and enc.get("type", "").startswith("image/"):
                return enc.get("href") or enc.get("url")

    # 4. Search within summary HTML
    raw_summary = getattr(entry, "summary", "") or ""
    if "<img" in raw_summary.lower():
        match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', raw_summary, re.IGNORECASE)
        if match:
            return match.group(1)

    return None


def fetch_news(category: str, query: str) -> List[Dict[str, Any]]:
    """Fetches and parses Tamil news articles from Google News RSS for a given category & query.

    Returns structured dictionaries matching the exact specification:
    {
        "title": "...",
        "url": "...",
        "source": "...",
        "category": "தமிழ்நாடு",
        "published_at": "...",
        "language": "ta",
        "image_url": "...",
        "summary": "...",
        "fetched_at": "..."
    }
    """
    rss_url = build_google_news_url(query)
    logger.info(f"Fetching RSS feed for category '{category}' (query: '{query}'): {rss_url}")

    try:
        req = urllib.request.Request(
            rss_url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "application/rss+xml, application/xml, text/xml, */*",
                "Accept-Language": "ta,en-US;q=0.9,en;q=0.8",
            },
        )
        with urllib.request.urlopen(req, timeout=20) as resp:
            xml_bytes = resp.read()
    except Exception as err:
        logger.error(f"Failed to fetch HTTP RSS feed for '{category}': {err}")
        return []

    try:
        feed = feedparser.parse(xml_bytes)
    except Exception as err:
        logger.error(f"Failed to parse XML RSS for '{category}': {err}")
        return []

    if getattr(feed, "bozo", 0) and not feed.entries:
        logger.warning(f"Feedparser bozo exception for '{category}': {getattr(feed, 'bozo_exception', 'Unknown')}")
        return []

    entries = feed.entries or []
    results: List[Dict[str, Any]] = []
    now_iso = datetime.now(timezone.utc).isoformat()

    for entry in entries:
        raw_title = getattr(entry, "title", "") or ""
        url = getattr(entry, "link", "") or ""

        if not raw_title or not url:
            continue

        # Extract source
        entry_source = ""
        source_obj = getattr(entry, "source", None)
        if isinstance(source_obj, dict):
            entry_source = source_obj.get("title") or ""
        elif hasattr(source_obj, "title"):
            entry_source = source_obj.title or ""

        headline, source = extract_source_and_title(raw_title, entry_source)

        # Clean summary
        raw_summary = getattr(entry, "summary", "") or ""
        clean_summary = clean_html_text(raw_summary)
        # Avoid duplicating the headline inside summary if it's identical
        if clean_summary == headline:
            clean_summary = ""

        # Parse publication date
        pub_date_str = getattr(entry, "published", None) or getattr(entry, "updated", None)
        published_at = parse_publication_date(pub_date_str)

        # Extract image if any
        image_url = extract_image_url(entry)

        item = {
            "title": headline,
            "url": url,
            "source": source,
            "category": category,
            "published_at": published_at,
            "fetched_at": now_iso,
            "language": "ta",
            "image_url": image_url,
            "summary": clean_summary,
        }
        results.append(item)

    logger.info(f"Successfully extracted {len(results)} articles for category '{category}'")
    return results
