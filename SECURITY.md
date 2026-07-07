# Security Policy (பாதுகாப்பு கொள்கை)

Sattavillaku is committed to maintaining the highest security standards to protect reader data and ensure a reliable publishing platform.

## Scope and Infrastructure
- **Hosting:** Vercel (Frontend & Edge Functions)
- **Database & Auth:** Supabase (PostgreSQL with Row Level Security)
- **Payments:** Razorpay (PCI-DSS Level 1 compliant)

## Payment Security (PCI DSS)
**Sattavillaku never touches, processes, or stores raw credit card data or UPI PINs.**
- All payment flows are handled entirely by Razorpay via their secure Checkout Modal.
- The only payment-related data stored in our database (`public.payments` and `public.subscriptions`) includes Razorpay Order IDs, Payment IDs, amounts, and status.

## Data Storage & Privacy
- **Stored Data:** Email addresses, display names, encrypted authentication tokens (via Supabase Auth), subscription periods, and saved bookmarks.
- **Never Stored:** Passwords in plaintext, Card Data, CVV, or Bank Account numbers.
- **Row Level Security (RLS):** All Supabase tables use RLS. Users can only query their own profiles, payments, and bookmarks. Administrative access is restricted to the single `admin` role.

## API & Threat Protection
- **Rate Limiting:** Vercel Edge Middleware enforces rate limits (60 requests/minute per IP) on all `/api/*` endpoints to prevent abuse and brute-force attacks.
- **Suspicious Activity:** The middleware is configured to flag and temporarily block IPs showing repeated failed authentication attempts.
- **Webhook Integrity:** Every webhook request received from Razorpay is cryptographically verified using HMAC SHA256 against the `RAZORPAY_WEBHOOK_SECRET` before any database changes are made.

## Reporting Vulnerabilities
If you discover a security vulnerability within the Sattavillaku platform, please report it immediately.
- **Contact:** contact@sattavilakku.com
- We aim to acknowledge all reports within 48 hours and resolve critical issues within 7 days.
