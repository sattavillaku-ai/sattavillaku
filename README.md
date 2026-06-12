# சட்டவிளக்கு (Sattavillaku) — Tamil News, Politics & Law Magazine

Sattavillaku is a digital publication platform built with Next.js 14, Supabase, and Razorpay. It offers a premium reading experience for Tamil audiences focusing on legal, political, and social analysis.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide React
- **Backend/Database:** Supabase (PostgreSQL), Edge Middleware
- **Payments:** Razorpay (UPI, Netbanking, Cards)
- **Editor:** Tiptap (Rich Text Editor tailored for Tamil typography)
- **Monitoring & CI/CD:** Sentry, Vercel Analytics, GitHub Actions

## Local Setup

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd tamil-magazine
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env.local` and fill in your Supabase and Razorpay credentials.
   ```bash
   cp .env.example .env.local
   ```

3. **Supabase Setup**
   Ensure you have the Supabase CLI installed.
   ```bash
   supabase init
   supabase start
   supabase db push
   supabase db reset # Optional: To apply seed data
   ```

4. **Razorpay Test Mode**
   - Create a Razorpay account and generate Test API Keys.
   - Configure a webhook pointing to your local environment (use `ngrok` or `localtunnel` pointing to `localhost:3000/api/webhooks/razorpay`).
   - Use test UPI/cards provided by Razorpay to verify the checkout flow.

5. **Run the App**
   ```bash
   npm run dev
   ```

## Admin Access (First-Time Setup)
Since this is a solo-editor platform, the initial admin setup requires a manual database update:
1. Register a new user via the `/register` page.
2. Go to your Supabase Dashboard -> Table Editor -> `users` table.
3. Find your user ID and change the `role` from `reader` to `admin`.
4. Log out and log back in to access the `/admin` dashboard.

## Deployment Checklist
- [ ] Connect repository to Vercel.
- [ ] Add all environment variables to Vercel Settings.
- [ ] Configure Razorpay Webhook to point to your Vercel production URL.
- [ ] Link Supabase project via the Vercel Integration.
- [ ] Verify GitHub Actions (`ci.yml` and `deploy.yml`) have necessary repository secrets.
