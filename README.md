# சட்டவிளக்கு (SATTAVILAKKU) — Digital Tamil Magazine & Daily News Portal

**சட்டவிளக்கு (Sattavilakku)** is a production-grade, modern Tamil monthly digital magazine and daily legal/political journalism website built with Next.js (App Router), TypeScript, Tailwind CSS, and a robust design system.

---

## 🏛️ Brand & Editorial Identity

* **Name (Tamil):** சட்டவிளக்கு
* **Name (English):** SATTAVILAKKU
* **Pillars:** Tamil journalism, Law, Trust, Authority, Modern digital publishing, Editorial professionalism.
* **Core Domains:** Law (சட்டம்), Politics (அரசியல்), Tamil Nadu (தமிழ்நாடு), India (இந்தியா), and Special Articles (சிறப்புக் கட்டுரைகள்).
* **RNI Registration:** TN-TAM/2022/84920
* **Typography Stack:**
  * Noto Sans Tamil (Primary body & headlines)
  * Noto Serif Tamil (Editorials & quotes)
  * Inter / Plus Jakarta Sans (English UI & metrics)

---

## 🌗 Light & Dark Mode System

* Fully themeable with CSS variables / design tokens.
* Supports **Light**, **Dark**, and **System** modes with persistent state via `next-themes`.
* Both modes are WCAG-friendly with high-contrast editorial hierarchy, muted borders, and restrained styling.
* Header theme toggle is available on all desktop and mobile views.

---

## 🧭 Complete Routes

### 🌐 Public Website
| Route | Description |
|---|---|
| `/` | Homepage (Current issue spotlight, today's news grid, featured articles spread, latest articles, previous issues, editorial connect) |
| `/magazine` | Magazine archive & edition directory with year filters |
| `/magazine/current` | Current edition hero, table of contents, and articles |
| `/magazine/archive` | Historical archive browser by year, month, and search query |
| `/magazine/[issue-slug]` | Interactive digital PDF reader with thumbnail sidebar, zoom, fullscreen, and TOC |
| `/articles` | Analysis & articles listing with category filters, search, and pagination |
| `/articles/[category]` | Dynamic category articles directory (e.g. `/articles/law`, `/articles/politics`) |
| `/articles/[article-slug]` | Full editorial article reader with font resizing (A-, A, A+, A++), focus reading mode, issue citation, author bio, and share buttons |
| `/news` | Daily digital news hub with category filters and breaking news bar |
| `/news/law` | Law news (Supreme Court, Madras High Court, District Courts, Judgments) |
| `/news/politics` | Tamil Nadu & Indian political developments, Parliament, Elections |
| `/news/tamil-nadu` | Tamil Nadu state policies, Secretariat decisions, social welfare |
| `/news/india` | National news, Union policies, interstate matters |
| `/search` | Multi-category search across articles, news, and issues with filter pills |
| `/about` | Editorial mission, RNI registration, ethics policy, and editorial board |
| `/contact` | Office details, press release submission, and contact form |

### 🔒 Admin Portal (Only Administrators)
| Route | Description |
|---|---|
| `/admin/login` | Secure administrator authentication (Supabase Auth ready, demo quick-fill helper provided) |
| `/admin` | Main dashboard with KPI cards, editorial workflow pipeline status, and quick CMS links |
| `/admin/issues` | Magazine issue management (List, publish/unpublish toggle, edit, delete, preview) |
| `/admin/issues/new` | Create new magazine issue (Title, issue number, cover upload, PDF upload, TOC builder) |
| `/admin/issues/[id]` | Edit existing issue |
| `/admin/articles` | Articles CMS (Search, category filter, status filter, publish/unpublish, edit, delete) |
| `/admin/articles/new` | TipTap-compatible rich text editor with full formatting toolbar and magazine citation links |
| `/admin/articles/[id]` | Edit existing article |
| `/admin/news` | Collected news feed dashboard with relevance score and status indicators |
| `/admin/news/review` | **Critical AI Review Screen:** Side-by-side view of original English/Tamil source vs. AI-generated Tamil draft with approval/rejection/publish actions |
| `/admin/media` | Media library with category tabs, search, copy URL, image preview, and upload modal (Cloudinary-ready) |
| `/admin/categories` | Manage editorial categories (Create, edit, reorder, delete) |
| `/admin/authors` | Manage editorial team & columnists (Bio, photo, role, articles count) |
| `/admin/settings` | Publication info, RNI number, office address, social links, and security configuration |

---

## ⚡ Backend Integration Ready

1. **Supabase:**
   * PostgreSQL database schema maps 1-to-1 with TypeScript interfaces in `src/types/index.ts`.
   * Admin authentication ready for Supabase Auth & Row Level Security (RLS).
2. **Cloudinary:**
   * Media upload components in `src/components/admin/media` and `article-form.tsx` accept direct Cloudinary secure URLs and signatures.
3. **Supabase Storage:**
   * Magazine PDF reader in `src/components/pdf-reader.tsx` accepts direct PDF URLs and is PDF.js architecture-ready.
4. **Gemini AI:**
   * News review workflow in `/admin/news/review` enforces the strict human-in-the-loop rule: AI-generated legal/political drafts must be verified and signed off by the editor before publication.

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run production build
npm run build

# Start production server
npm start
```
