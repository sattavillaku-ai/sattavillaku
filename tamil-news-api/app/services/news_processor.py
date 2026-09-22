import logging
import re
import unicodedata
from typing import List, Dict, Any, Set, Optional
from app.config import settings
from app.database.supabase import db_service
from app.services.rss_fetcher import fetch_news

logger = logging.getLogger("tamil_news.processor")


def normalize_title_for_comparison(title: str) -> str:
    """Normalizes title text for fuzzy duplicate detection:
    - Normalizes Unicode characters (NFKC)
    - Converts to lowercase
    - Removes punctuation, symbols, and extra spaces
    - Strips common news outlet suffixes
    """
    if not title:
        return ""

    # Unicode normalization
    text = unicodedata.normalize("NFKC", title).strip()

    # Strip common Tamil / English outlet branding suffixes
    outlets = [
        "தினமலர்",
        "தினத்தந்தி",
        "தினமணி",
        "தினகரன்",
        "மாலைமலர்",
        "புதிய தலைமுறை",
        "பாலிமர்",
        "நியூஸ் 18",
        "பிபிசி",
        "தி இந்து",
        "சமயம் தமிழ்",
        "ஒன்இந்தியா",
        "dinamalar",
        "dailythanthi",
        "dinamani",
        "dinakaran",
        "bbc",
        "the hindu",
        "puthiyathalaimurai",
        "polimer",
        "news18",
        "oneindia",
    ]
    for outlet in outlets:
        pattern = re.compile(rf"\s*[-–|:]\s*{outlet}.*$", re.IGNORECASE)
        text = pattern.sub("", text)

    # Remove punctuation
    text = re.sub(r"[^\w\s\u0B80-\u0BFF]", " ", text)
    # Collapse multiple whitespaces
    text = re.sub(r"\s+", " ", text).strip().lower()
    return text


class NewsProcessor:
    """Orchestrates fetching, deduplicating, and persisting Tamil news articles."""

    def __init__(self):
        # Cache of recently processed normalized titles to prevent intra-batch duplicates
        self._seen_normalized_titles: Set[str] = set()

    def process_category(self, category: str, query: Optional[str] = None) -> Dict[str, Any]:
        """Fetches news for a specific category, filters duplicates, and inserts new records into Supabase."""
        search_query = query or settings.CATEGORY_QUERIES.get(category, category)
        print(f"[INFO] Fetching {category}")
        logger.info(f"[INFO] Fetching {category}")

        try:
            articles = fetch_news(category=category, query=search_query)
        except Exception as err:
            print(f"[ERROR] Failed to fetch {category}: {err}")
            logger.error(f"[ERROR] Failed to fetch {category}: {err}")
            return {
                "category": category,
                "articles_found": 0,
                "inserted": 0,
                "duplicates": 0,
                "error": str(err),
            }

        total_found = len(articles)
        inserted_count = 0
        duplicate_count = 0

        for article in articles:
            url = article.get("url", "").strip()
            title = article.get("title", "").strip()

            if not url or not title:
                continue

            # 1. URL-level deduplication: check in database
            if db_service.is_url_existing(url):
                duplicate_count += 1
                continue

            # 2. Title-level deduplication: check normalized title
            norm_title = normalize_title_for_comparison(title)
            if norm_title and norm_title in self._seen_normalized_titles:
                duplicate_count += 1
                continue

            # 3. Insert new article
            inserted = db_service.insert_news_item(article)
            if inserted:
                inserted_count += 1
                if norm_title:
                    self._seen_normalized_titles.add(norm_title)
                    # Keep cache memory bounded
                    if len(self._seen_normalized_titles) > 5000:
                        self._seen_normalized_titles.clear()
            else:
                # If insertion failed (e.g. unique constraint collision or DB rejection)
                duplicate_count += 1

        print(f"[INFO] {total_found} articles found")
        print(f"[INFO] {inserted_count} new articles inserted")
        print(f"[INFO] {duplicate_count} duplicates skipped")
        logger.info(f"[INFO] {category}: {total_found} found, {inserted_count} inserted, {duplicate_count} skipped")

        return {
            "category": category,
            "articles_found": total_found,
            "inserted": inserted_count,
            "duplicates": duplicate_count,
            "error": None,
        }

    def process_all_categories(self) -> List[Dict[str, Any]]:
        """Iterates through all configured categories sequentially.
        Ensures a single category failure never stops remaining categories.
        """
        results: List[Dict[str, Any]] = []
        logger.info(f"Starting news processing batch for {len(settings.CATEGORIES)} categories...")

        for cat in settings.CATEGORIES:
            try:
                res = self.process_category(category=cat)
                results.append(res)
            except Exception as err:
                print(f"[ERROR] Failed to fetch {cat}: {err}")
                logger.error(f"[ERROR] Failed to fetch {cat}: {err}")
                results.append({
                    "category": cat,
                    "articles_found": 0,
                    "inserted": 0,
                    "duplicates": 0,
                    "error": str(err),
                })

        total_inserted = sum(r["inserted"] for r in results)
        total_dups = sum(r["duplicates"] for r in results)
        logger.info(f"Completed news processing batch: {total_inserted} inserted, {total_dups} duplicates skipped.")
        return results

news_processor = NewsProcessor()
