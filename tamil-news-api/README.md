# Tamil News Aggregation API (தமிழ் செய்தி திரட்டி)

A high-performance, **100% free Tamil news aggregation backend** built with **Python 3.12+**, **FastAPI**, **Google News RSS**, and **Supabase PostgreSQL**.

The system automatically and continuously fetches real-time Tamil news headlines across 12 major categories, deduplicates articles by URL and normalized Tamil headlines, stores structured metadata in Supabase PostgreSQL, and serves clean REST endpoints to React/Next.js frontend applications.

---

## Architecture

```text
                 Google News RSS
           (hl=ta&gl=IN&ceid=IN:ta)
                        │
                        ▼
            Tamil RSS Fetcher (app/services/rss_fetcher.py)
                        │
                        ▼
           Data Processor & Deduplication (app/services/news_processor.py)
                        │
             ┌──────────┴──────────┐
             │                     │
         Duplicate?           New Article
             │                     │
           Skip                    ▼
                        Supabase PostgreSQL (public.news_items)
                                   │
                                   ▼
                         FastAPI REST API (app/routes/news.py)
                                   │
                                   ▼
                        React / Next.js Frontend
```

---

## Key Features

- **100% Free**: Uses Google News RSS feeds without needing paid API keys or subscriptions.
- **Deduplication**: 
  - Database-level unique URL constraint (`url unique`).
  - Title normalization stripping Tamil outlet suffixes (e.g. ` - தினமலர்`, ` - தினத்தந்தி`, ` - புதிய தலைமுறை`).
- **Autonomous Scheduler**: Uses `APScheduler` to cycle through all 12 categories every 10 minutes (configurable via `.env`).
- **Fault-Tolerant**: Network errors or malformed feeds in one category never crash the scheduler or prevent other categories from processing.
- **RESTful API**: Fast, typed endpoints with Pydantic validation, CORS headers, and OpenAPI Swagger documentation (`/docs`).
- **Dual-Schema Adaptability**: Works out of the box with brand new Supabase tables or existing Next.js CMS tables.

---

## Supported Tamil Categories

The system automatically queries and categorizes news under 12 core Tamil topics:

1. **தமிழ்நாடு** (Tamil Nadu)
2. **சென்னை** (Chennai)
3. **இந்தியா** (India)
4. **உலகம்** (World)
5. **அரசியல்** (Politics)
6. **வணிகம்** (Business)
7. **தொழில்நுட்பம்** (Technology)
8. **விளையாட்டு** (Sports)
9. **சினிமா** (Cinema)
10. **கல்வி** (Education)
11. **வேலைவாய்ப்பு** (Jobs & Careers)
12. **பங்குச்சந்தை** (Stock Market & Investments)

---

## Project Structure

```text
tamil-news-api/
│
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI application entrypoint & lifespan
│   ├── config.py                # Environment and category configurations
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   └── news.py              # REST API route handlers & Pydantic models
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── rss_fetcher.py       # Google News RSS parser with Tamil URL encoding
│   │   ├── news_processor.py    # Deduplication and batch insertion logic
│   │   └── scheduler.py         # APScheduler automated cron worker
│   │
│   └── database/
│       ├── __init__.py
│       └── supabase.py          # Supabase PostgreSQL client & query service
│
├── schema.sql                   # Supabase PostgreSQL DDL and index setup
├── .env                         # Local environment variables
├── .env.example                 # Example configuration template
├── requirements.txt             # Python dependencies
└── README.md                    # Documentation
```

---

## Requirements

- Python 3.12 or higher
- Pip package manager
- Supabase account & project (free tier works completely)

---

## Installation

### 1. Navigate to the project directory
```bash
cd tamil-news-api
```

### 2. Create and activate a Python virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

---

## Supabase Setup & Database SQL

In your [Supabase Dashboard](https://app.supabase.com):
1. Navigate to **SQL Editor**.
2. Run the SQL statements located in `schema.sql`:

```sql
-- 1. Create news_items table
create table if not exists public.news_items (
    id uuid primary key default gen_random_uuid(),

    title text not null,
    url text not null unique,

    source text,
    category text,

    published_at timestamptz,
    fetched_at timestamptz default now(),

    language text default 'ta',

    image_url text,
    summary text,

    created_at timestamptz default now()
);

-- 2. Performance indexes
create index if not exists idx_news_items_url on public.news_items (url);
create index if not exists idx_news_items_category on public.news_items (category);
create index if not exists idx_news_items_published_at on public.news_items (published_at desc);
create index if not exists idx_news_items_fetched_at on public.news_items (fetched_at desc);

-- 3. Row Level Security (RLS)
alter table public.news_items enable row level security;

create policy "Allow public read access to news_items"
    on public.news_items for select using (true);

create policy "Allow service role full access to news_items"
    on public.news_items for all using (true) with check (true);
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
# Supabase PostgreSQL Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-role-key

# Automated News Collection Interval (minutes)
NEWS_FETCH_INTERVAL_MINUTES=10

# Server Configuration
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development

# CORS Configuration (allowed origins)
CORS_ORIGINS=*
```

---

## Running the Application

Start the FastAPI server (which automatically initializes and starts the background scheduler):

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Or run directly via python:
```bash
python app/main.py
```

Console output will display:
```text
[INFO] Starting Tamil News Aggregation API Backend...
[INFO] Target Language: Tamil (ta-IN)
[INFO] Interval: every 10 minutes
[INFO] Supabase client connected successfully.
[INFO] Fetching தமிழ்நாடு
[INFO] 109 articles found
[INFO] 18 new articles inserted
[INFO] 91 duplicates skipped
```

---

## API Documentation

Once running, interactive API docs are available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Summary of Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API Metadata & Category Directory |
| `GET` | `/health` | Service health & Supabase connection status |
| `GET` | `/news` | Paginated news (`?page=1&limit=20&category=வணிகம்`) |
| `GET` | `/news/latest` | Latest news sorted by `published_at DESC` |
| `GET` | `/news/category/{category}` | News filtered by Tamil category name |
| `GET` | `/news/search` | Search article titles and summaries (`?q=சென்னை`) |
| `GET` | `/news/{id}` | Retrieve single article by UUID |
| `POST` | `/news/fetch` | Trigger immediate on-demand news collection cycle |

---

## Example API Responses

### 1. `GET /news?page=1&limit=2&category=தமிழ்நாடு`
```json
{
  "page": 1,
  "limit": 2,
  "total": 45,
  "items": [
    {
      "id": "e3aa4d01-80be-42cb-80be-771d860d15cc",
      "title": "தமிழகத்தில் புதிய தகவல் தொழில்நுட்ப பூங்கா: முதல்வர் அடிக்கல்",
      "url": "https://news.google.com/rss/articles/CBMi...",
      "source": "தினத்தந்தி",
      "category": "தமிழ்நாடு",
      "published_at": "2026-09-22T06:30:00+00:00",
      "fetched_at": "2026-09-22T06:35:10+00:00",
      "language": "ta",
      "image_url": "https://images.unsplash.com/...",
      "summary": "சென்னையில் தொழில் வளர்ச்சியை ஊக்குவிக்க புதிய பூங்கா அமைக்கப்படவுள்ளது.",
      "created_at": "2026-09-22T06:35:10+00:00"
    }
  ]
}
```

### 2. `GET /health`
```json
{
  "status": "ok",
  "database": "connected",
  "scheduler_running": true,
  "configured_interval_minutes": 10,
  "categories_count": 12,
  "categories": [
    "தமிழ்நாடு",
    "சென்னை",
    "இந்தியா",
    "உலகம்",
    "அரசியல்",
    "வணிகம்",
    "தொழில்நுட்பம்",
    "விளையாட்டு",
    "சினிமா",
    "கல்வி",
    "வேலைவாய்ப்பு",
    "பங்குச்சந்தை"
  ]
}
```

---

## Troubleshooting

1. **Tamil Characters Garbled in Windows Terminal**:
   - The application automatically configures `sys.stdout` to UTF-8. If running on PowerShell, you can also run:
     ```powershell
     [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
     ```
2. **Google News RSS 429 or Blocked**:
   - `rss_fetcher.py` sends realistic browser headers (`User-Agent: Mozilla/5.0...`). Avoid setting interval lower than 3 minutes.
3. **Database Insertion Errors**:
   - Check that `SUPABASE_URL` and `SUPABASE_KEY` are correct in `.env`.
   - Ensure Row Level Security (RLS) policies permit insert operations or use the Supabase `service_role` secret in server environments.
