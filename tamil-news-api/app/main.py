import logging
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes.news import router as news_router
from app.services.scheduler import news_scheduler

# Ensure stdout uses UTF-8 encoding across Windows/Linux
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("tamil_news.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manages application startup and graceful shutdown."""
    logger.info("==================================================")
    logger.info("Starting Tamil News Aggregation API Backend...")
    logger.info(f"Target Language: Tamil (ta-IN)")
    logger.info(f"Interval: every {settings.NEWS_FETCH_INTERVAL_MINUTES} minutes")
    logger.info(f"Supabase configured: {'YES' if settings.SUPABASE_URL else 'NO (running local mock/unauthenticated)'}")
    logger.info("==================================================")

    # Start the automated Google News RSS scheduler
    news_scheduler.start(run_immediately=True)

    yield

    # Graceful shutdown
    logger.info("Shutting down Tamil News Aggregation API...")
    news_scheduler.shutdown()


# Initialize FastAPI application
app = FastAPI(
    title="Tamil News Aggregation API (தமிழ் செய்தி திரட்டி)",
    description=(
        "Free, automated Tamil news aggregation backend using Python, FastAPI, "
        "Google News RSS, and Supabase PostgreSQL. Automatically collects, deduplicates, "
        "and categorizes news articles every 10 minutes across 12 major Tamil categories."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for React / Next.js frontend integration
cors_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
if not cors_origins or "*" in cors_origins:
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True if "*" not in cors_origins else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(news_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
    )
