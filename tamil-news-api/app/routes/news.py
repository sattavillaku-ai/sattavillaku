import logging
from typing import Optional, List, Any
from datetime import datetime
from fastapi import APIRouter, Query, Path, HTTPException, status
from pydantic import BaseModel, Field
from app.config import settings
from app.database.supabase import db_service
from app.services.scheduler import news_scheduler

logger = logging.getLogger("tamil_news.routes")

router = APIRouter(tags=["News"])


# ----------------------------------------------------
# Pydantic Schemas
# ----------------------------------------------------

class NewsItemResponse(BaseModel):
    """Schema representing a single Tamil news article."""
    id: str = Field(description="Unique UUID of the article")
    title: str = Field(description="Headline in Tamil")
    url: str = Field(description="Original article URL")
    source: Optional[str] = Field(default="Google News (Tamil)", description="Publisher name")
    category: Optional[str] = Field(default="", description="Tamil category name")
    published_at: Optional[Any] = Field(default=None, description="ISO timestamp of article publication")
    fetched_at: Optional[Any] = Field(default=None, description="ISO timestamp of RSS ingestion")
    language: str = Field(default="ta", description="Language code (Tamil)")
    image_url: Optional[str] = Field(default=None, description="Lead image URL if available")
    summary: Optional[str] = Field(default="", description="Cleaned article snippet/summary")
    created_at: Optional[Any] = Field(default=None, description="Database record creation timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "c1f729b2-3e28-4e3a-9694-811cba77e68e",
                "title": "தமிழ்நாட்டில் புதிய தொழிற்பேட்டை: முதல்வர் மு.க. ஸ்டாலின் அடிக்கல்",
                "url": "https://news.google.com/rss/articles/...",
                "source": "தினத்தந்தி",
                "category": "தமிழ்நாடு",
                "published_at": "2026-09-22T06:00:00+00:00",
                "fetched_at": "2026-09-22T06:15:00+00:00",
                "language": "ta",
                "image_url": "https://images.unsplash.com/...",
                "summary": "தொழில் வளர்ச்சியை ஊக்குவிக்க புதிய தொழிற்பேட்டைக்கு அடிக்கல் நாட்டப்பட்டது.",
                "created_at": "2026-09-22T06:15:00+00:00",
            }
        }


class PaginatedNewsResponse(BaseModel):
    """Schema for paginated news response."""
    page: int = Field(default=1, description="Current page number")
    limit: int = Field(default=20, description="Items per page")
    total: int = Field(default=0, description="Total matching items found")
    items: List[NewsItemResponse] = Field(default_factory=list, description="List of news articles")


class HealthResponse(BaseModel):
    """Schema for system health check."""
    status: str
    database: str
    scheduler_running: bool
    configured_interval_minutes: int
    categories_count: int
    categories: List[str]


# ----------------------------------------------------
# Route Endpoints
# ----------------------------------------------------

@router.get("/", summary="API Root & Overview")
def get_root():
    """Returns basic API overview, system status, and available category filters."""
    return {
        "title": "Tamil News Aggregation API (தமிழ் செய்தி திரட்டி)",
        "version": "1.0.0",
        "language": "Tamil (ta-IN)",
        "source": "Google News RSS",
        "database": "Supabase PostgreSQL",
        "scheduler_interval_minutes": settings.NEWS_FETCH_INTERVAL_MINUTES,
        "available_categories": settings.CATEGORIES,
        "endpoints": {
            "health": "/health",
            "all_news": "/news?page=1&limit=20&category=வணிகம்",
            "latest_news": "/news/latest?limit=20",
            "category_news": "/news/category/{category}?page=1&limit=20",
            "search": "/news/search?q=சென்னை&page=1&limit=20",
            "single_news": "/news/{id}",
            "manual_fetch": "POST /news/fetch (trigger on-demand aggregation)",
            "docs": "/docs",
        },
    }


@router.get("/health", response_model=HealthResponse, summary="System Health Check")
def health_check():
    """Returns database connection status, scheduler status, and configured categories."""
    db_ok = db_service.health_check()
    return HealthResponse(
        status="ok" if db_ok else "degraded",
        database="connected" if db_ok else "disconnected_or_unreachable",
        scheduler_running=news_scheduler.is_running(),
        configured_interval_minutes=settings.NEWS_FETCH_INTERVAL_MINUTES,
        categories_count=len(settings.CATEGORIES),
        categories=settings.CATEGORIES,
    )


@router.get("/news", response_model=PaginatedNewsResponse, summary="Get Paginated News")
def get_news_list(
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Items per page (max 100)"),
    category: Optional[str] = Query(default=None, description="Filter by category (e.g. வணிகம், தமிழ்நாடு)"),
):
    """Retrieves paginated news items, optionally filtered by category.
    Returns:
    {
      "page": 1,
      "limit": 20,
      "total": 100,
      "items": [...]
    }
    """
    items, total = db_service.get_news(page=page, limit=limit, category=category)
    return PaginatedNewsResponse(
        page=page,
        limit=limit,
        total=total,
        items=items,
    )


@router.get("/news/latest", response_model=List[NewsItemResponse], summary="Get Latest News")
def get_latest_news(
    limit: int = Query(default=20, ge=1, le=100, description="Maximum number of items to return"),
):
    """Returns the latest Tamil news ordered by published_at DESC."""
    items = db_service.get_latest_news(limit=limit)
    return items


@router.get("/news/category/{category}", response_model=PaginatedNewsResponse, summary="Get News By Category")
def get_news_by_category(
    category: str = Path(..., description="Tamil category name (e.g. தமிழ்நாடு, அரசியல், வணிகம்)"),
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Items per page"),
):
    """Retrieves paginated news for a specific Tamil category."""
    items, total = db_service.get_news_by_category(category=category, page=page, limit=limit)
    return PaginatedNewsResponse(
        page=page,
        limit=limit,
        total=total,
        items=items,
    )


@router.get("/news/search", response_model=PaginatedNewsResponse, summary="Search News")
def search_news(
    q: str = Query(..., min_length=1, description="Search term in Tamil or English"),
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Items per page"),
):
    """Searches article titles and summaries for the specified query string."""
    items, total = db_service.search_news(query_str=q, page=page, limit=limit)
    return PaginatedNewsResponse(
        page=page,
        limit=limit,
        total=total,
        items=items,
    )


@router.get("/news/{id}", response_model=NewsItemResponse, summary="Get News Article by ID")
def get_news_item_by_id(
    id: str = Path(..., description="UUID of the news article"),
):
    """Retrieves a single news article by its unique ID."""
    item = db_service.get_news_by_id(item_id=id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"News article with ID '{id}' was not found.",
        )
    return item


@router.post("/news/fetch", summary="Trigger On-Demand News Collection")
async def trigger_fetch(
    category: Optional[str] = Query(default=None, description="Optional single category to fetch"),
):
    """Manually triggers the news collection process immediately.
    Useful for testing or ad-hoc syncs without waiting for the 10-minute scheduler interval.
    """
    logger.info(f"Manual news collection requested (category: {category or 'ALL'})")
    result = await news_scheduler.trigger_immediate_run(category=category)
    return {
        "status": "success",
        "message": f"News collection finished for {category or 'all categories'}.",
        "result": result,
    }
