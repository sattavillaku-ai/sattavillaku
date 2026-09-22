import logging
from typing import Optional, List, Tuple, Dict, Any
from datetime import datetime
from supabase import create_client, Client
from app.config import settings

logger = logging.getLogger("tamil_news.database")

_client: Optional[Client] = None
_use_legacy_schema: bool = False


def check_schema_compatibility(cli: Client, table_name: str):
    """Proactively detects whether news_items uses standard or legacy columns."""
    global _use_legacy_schema
    try:
        res = cli.table(table_name).select("*").limit(1).execute()
        if res.data and len(res.data) > 0:
            sample = res.data[0]
            if "original_url" in sample and "url" not in sample:
                _use_legacy_schema = True
                logger.info("Detected legacy CMS schema (original_title / original_url). Adaptive mapping enabled.")
            else:
                logger.info("Detected standard schema (title / url).")
    except Exception as e:
        logger.warning(f"Schema detection note: {e}")


def get_supabase_client() -> Optional[Client]:
    """Initializes or returns singleton Supabase client."""
    global _client
    if _client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            logger.warning(
                "SUPABASE_URL or SUPABASE_KEY not configured. Running in unauthenticated or local mock mode."
            )
            return None
        try:
            _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            logger.info(f"Supabase client connected successfully to {settings.SUPABASE_URL}")
            check_schema_compatibility(_client, "news_items")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            return None
    return _client


def normalize_row(row: Dict[str, Any]) -> Dict[str, Any]:
    """Normalizes database row into standard API format.
    Handles both standard news_items schema and legacy CMS schema seamlessly.
    """
    return {
        "id": str(row.get("id", "")),
        "title": row.get("title") or row.get("original_title") or "",
        "url": row.get("url") or row.get("original_url") or "",
        "source": row.get("source") or row.get("source_name") or "",
        "category": row.get("category") or "",
        "published_at": row.get("published_at"),
        "fetched_at": row.get("fetched_at") or row.get("discovered_at") or row.get("created_at"),
        "language": row.get("language") or "ta",
        "image_url": row.get("image_url"),
        "summary": row.get("summary") or row.get("original_content") or "",
        "created_at": row.get("created_at"),
    }


class DatabaseService:
    """Encapsulates all Supabase news_items queries and insertions."""

    def __init__(self):
        self.table_name = "news_items"

    @property
    def client(self) -> Optional[Client]:
        return get_supabase_client()

    def health_check(self) -> bool:
        """Verifies database connectivity."""
        cli = self.client
        if not cli:
            return False
        try:
            res = cli.table(self.table_name).select("id").limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False

    def is_url_existing(self, url: str) -> bool:
        """Checks if an article URL has already been stored."""
        cli = self.client
        if not cli or not url:
            return False
        global _use_legacy_schema

        if _use_legacy_schema:
            try:
                res_legacy = cli.table(self.table_name).select("id").eq("original_url", url).limit(1).execute()
                if res_legacy.data and len(res_legacy.data) > 0:
                    return True
            except Exception:
                pass
            return False

        try:
            # Check standard 'url' column
            res = cli.table(self.table_name).select("id").eq("url", url).limit(1).execute()
            if res.data and len(res.data) > 0:
                return True
        except Exception:
            _use_legacy_schema = True
            # Fallback: Check 'original_url' if standard column query failed
            try:
                res_legacy = cli.table(self.table_name).select("id").eq("original_url", url).limit(1).execute()
                if res_legacy.data and len(res_legacy.data) > 0:
                    return True
            except Exception:
                pass
        return False

    def insert_news_item(self, item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Inserts a new article into Supabase.
        Automatically detects table schema and handles standard and legacy columns.
        """
        cli = self.client
        global _use_legacy_schema
        if not cli:
            logger.warning(f"Skipping DB insertion for '{item.get('title')}': Supabase not configured.")
            return None

        # Standard schema payload
        standard_record = {
            "title": item.get("title"),
            "url": item.get("url"),
            "source": item.get("source"),
            "category": item.get("category"),
            "published_at": item.get("published_at"),
            "fetched_at": item.get("fetched_at") or datetime.utcnow().isoformat(),
            "language": item.get("language", "ta"),
            "image_url": item.get("image_url"),
            "summary": item.get("summary"),
        }

        # Legacy schema fallback payload
        legacy_record = {
            "original_title": item.get("title"),
            "original_url": item.get("url"),
            "source_name": item.get("source"),
            "category": item.get("category"),
            "published_at": item.get("published_at"),
            "discovered_at": item.get("fetched_at") or datetime.utcnow().isoformat(),
            "original_content": item.get("summary"),
            "status": "published",
        }

        # If already known to be legacy schema, insert legacy payload directly
        if _use_legacy_schema:
            try:
                res = cli.table(self.table_name).insert(legacy_record).execute()
                if res.data:
                    return normalize_row(res.data[0])
            except Exception as err:
                logger.error(f"Legacy insert failed: {err}")
                return None

        try:
            res = cli.table(self.table_name).insert(standard_record).execute()
            if res.data:
                return normalize_row(res.data[0])
        except Exception as err:
            err_msg = str(err).lower()
            # If standard schema column doesn't exist, switch to legacy schema
            if "column" in err_msg or "pgrst204" in err_msg:
                _use_legacy_schema = True
                logger.info("Detected legacy news_items schema. Falling back to original_title/original_url columns.")
                try:
                    res_leg = cli.table(self.table_name).insert(legacy_record).execute()
                    if res_leg.data:
                        return normalize_row(res_leg.data[0])
                except Exception as leg_err:
                    logger.error(f"Failed to insert with legacy schema: {leg_err}")
                    return None
            else:
                logger.error(f"Database insert error: {err}")
                return None

        return None

    def get_news(
        self, page: int = 1, limit: int = 20, category: Optional[str] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Retrieves paginated news items, optionally filtered by category."""
        cli = self.client
        if not cli:
            return [], 0

        page = max(1, page)
        limit = max(1, min(100, limit))
        start = (page - 1) * limit
        end = start + limit - 1

        try:
            query = cli.table(self.table_name).select("*", count="exact")

            if category and category.strip():
                query = query.eq("category", category.strip())

            # Sort by published_at desc, fallback to created_at desc
            try:
                query = query.order("published_at", desc=True)
            except Exception:
                query = query.order("created_at", desc=True)

            res = query.range(start, end).execute()
            total = res.count if res.count is not None else len(res.data)
            items = [normalize_row(r) for r in (res.data or [])]
            return items, total
        except Exception as e:
            logger.error(f"Error fetching news list: {e}")
            return [], 0

    def get_latest_news(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieves latest news ordered by published_at DESC."""
        cli = self.client
        if not cli:
            return []
        limit = max(1, min(100, limit))
        try:
            res = (
                cli.table(self.table_name)
                .select("*")
                .order("published_at", desc=True)
                .limit(limit)
                .execute()
            )
            return [normalize_row(r) for r in (res.data or [])]
        except Exception as e:
            logger.error(f"Error fetching latest news: {e}")
            return []

    def get_news_by_category(
        self, category: str, page: int = 1, limit: int = 20
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Retrieves paginated news for a specific Tamil category."""
        return self.get_news(page=page, limit=limit, category=category)

    def search_news(
        self, query_str: str, page: int = 1, limit: int = 20
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Searches titles and summaries for given query text."""
        cli = self.client
        if not cli or not query_str.strip():
            return [], 0

        page = max(1, page)
        limit = max(1, min(100, limit))
        start = (page - 1) * limit
        end = start + limit - 1

        clean_q = query_str.strip()
        global _use_legacy_schema
        if _use_legacy_schema:
            try:
                query_leg = (
                    cli.table(self.table_name)
                    .select("*", count="exact")
                    .or_(f"original_title.ilike.%{clean_q}%,original_content.ilike.%{clean_q}%")
                    .order("published_at", desc=True)
                    .range(start, end)
                )
                res_leg = query_leg.execute()
                total = res_leg.count if res_leg.count is not None else len(res_leg.data)
                return [normalize_row(r) for r in (res_leg.data or [])], total
            except Exception as err:
                logger.error(f"Error searching news with legacy schema: {err}")
                return [], 0

        try:
            # Query standard title/summary
            query = (
                cli.table(self.table_name)
                .select("*", count="exact")
                .or_(f"title.ilike.%{clean_q}%,summary.ilike.%{clean_q}%")
                .order("published_at", desc=True)
                .range(start, end)
            )
            res = query.execute()
            total = res.count if res.count is not None else len(res.data)
            return [normalize_row(r) for r in (res.data or [])], total
        except Exception:
            _use_legacy_schema = True
            # Fallback to legacy original_title/original_content
            try:
                query_leg = (
                    cli.table(self.table_name)
                    .select("*", count="exact")
                    .or_(f"original_title.ilike.%{clean_q}%,original_content.ilike.%{clean_q}%")
                    .order("published_at", desc=True)
                    .range(start, end)
                )
                res_leg = query_leg.execute()
                total = res_leg.count if res_leg.count is not None else len(res_leg.data)
                return [normalize_row(r) for r in (res_leg.data or [])], total
            except Exception as err2:
                logger.error(f"Error searching news: {err2}")
                return [], 0

    def get_news_by_id(self, item_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single news article by ID."""
        cli = self.client
        if not cli or not item_id:
            return None
        try:
            res = cli.table(self.table_name).select("*").eq("id", item_id).limit(1).execute()
            if res.data and len(res.data) > 0:
                return normalize_row(res.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching news by ID {item_id}: {e}")
            return None


db_service = DatabaseService()
