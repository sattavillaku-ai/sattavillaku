import logging
import asyncio
from typing import Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.config import settings
from app.services.news_processor import news_processor

logger = logging.getLogger("tamil_news.scheduler")


class NewsScheduler:
    """Manages periodic automated news aggregation from Google News RSS."""

    def __init__(self):
        self._scheduler: Optional[AsyncIOScheduler] = None
        self._is_running: bool = False
        self._is_job_executing: bool = False

    def is_running(self) -> bool:
        return self._is_running and self._scheduler is not None and self._scheduler.running

    async def _execute_collection_job(self):
        """Job function called periodically by APScheduler.
        Includes overlap lock to prevent parallel runs if network is slow.
        """
        if self._is_job_executing:
            logger.warning("Previous news collection job is still running. Skipping current interval tick.")
            return

        self._is_job_executing = True
        logger.info("Starting scheduled news collection cycle...")
        try:
            # Run CPU/network sync processing in a worker thread to keep FastAPI event loop responsive
            await asyncio.to_thread(news_processor.process_all_categories)
        except Exception as err:
            logger.error(f"Error during scheduled news collection cycle: {err}")
        finally:
            self._is_job_executing = False
            logger.info("Finished scheduled news collection cycle.")

    def start(self, run_immediately: bool = True):
        """Starts the APScheduler."""
        if self._scheduler is not None and self._scheduler.running:
            logger.info("Scheduler already active.")
            return

        interval_mins = max(1, settings.NEWS_FETCH_INTERVAL_MINUTES)
        logger.info(f"Initializing AsyncIOScheduler with {interval_mins}-minute interval...")

        self._scheduler = AsyncIOScheduler()
        self._scheduler.add_job(
            self._execute_collection_job,
            trigger=IntervalTrigger(minutes=interval_mins),
            id="tamil_news_rss_aggregator",
            name="Tamil Google News RSS Aggregator",
            replace_existing=True,
            max_instances=1,
        )
        self._scheduler.start()
        self._is_running = True
        logger.info(f"News collection scheduler started. Fetching every {interval_mins} minutes.")

        # Optionally schedule an immediate run shortly after startup
        if run_immediately:
            asyncio.create_task(self._execute_collection_job())

    def shutdown(self):
        """Gracefully terminates the scheduler."""
        if self._scheduler is not None and self._scheduler.running:
            logger.info("Shutting down news collection scheduler...")
            self._scheduler.shutdown(wait=False)
            self._is_running = False
            logger.info("Scheduler stopped successfully.")

    async def trigger_immediate_run(self, category: Optional[str] = None):
        """Allows on-demand trigger via API endpoint."""
        if category:
            return await asyncio.to_thread(news_processor.process_category, category)
        else:
            return await asyncio.to_thread(news_processor.process_all_categories)


news_scheduler = NewsScheduler()
