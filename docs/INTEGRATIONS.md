# Integrations

Client vs server ownership. No secrets in this file.

| Integration | Purpose | Owner | Env (names only) | Callback / webhook | Failure handling |
|---|---|---|---|---|---|
| ariesxpert-backend REST | Source of truth | Both clients via BFF | `BACKEND_API_BASE_URL` | — | Throw `ApiError`; show error state; never fake data |
| Socket.io | Lead, wallet, SOS, flash, chat signals | Backend + both clients | same origin | JWT handshake | Refetch REST; show disconnected badge |
| MSG91 | Expert OTP / SMS | Backend | `MSG91AUTHKEY`, `MSG91TEMPLATEID` | — | Login form error |
| Firebase Cloud Messaging | Mobile push | Mobile + backend | Firebase admin JSON | FCM | Web uses in-app inbox + optional Web Push |
| Firebase Auth custom token | Mobile Firestore/FCM glue | Mobile | Firebase web config | — | Web does **not** use Firebase for expert login |
| AWS S3 | KYC / proofs | Backend | `S3_BUCKET_NAME`, AWS keys | — | Upload error; keep previous URL |
| Cashfree | Onboarding fee, QR, payouts | Backend + hosted checkout | Cashfree env vars | `/api/app/transaction/cashfreeWebhook`, finance webhooks | Poll `payments/status`; webhook is authoritative |
| Razorpay | INR checkout | Backend + hosted checkout | Razorpay key via AppConfig | finance + transaction webhooks | Same as Cashfree |
| Stripe | Global payout adapter | Backend | Stripe keys | payout webhooks | Not a first-class web checkout |
| Google Maps | Navigation, arrival, SOS map | Mobile native / web JS | `GOOGLE_MAPS_API_KEY` via `GET /api/app/integrations/google-maps/mobile-config` | — | Denied geolocation UX; no fake GPS |
| Agora RTC | Telehealth video | Mobile native / web SDK | `AGORA_APP_ID` (dart-define / backend token) | — | Fallback to `meetLink` if join fails |
| LiveKit | AI avatar SFU | Backend + optional web | `wss://api.ariesxpert.com/rtc/` | — | Skip native DUIX; text Buddy if WebRTC blocked |
| Exotel | Click-to-call overlay | Mobile | Exotel env | `POST /integrations/exotel/call` | PLATFORM-SPECIFIC |
| WhatsApp (Meta) | Templates, visit OTP | Backend | WhatsApp token/app secret | Meta webhooks | Expert prefs only on web |
| SMTP / SES / SendGrid | Email | Backend | SMTP/SES/SendGrid | — | Verification / tickets |
| Redis + BullMQ | Queues, socket adapter | Backend | `REDIS_URL` | — | Transparent |
| Sentry | Backend observability | Backend | `SENTRY_DSN` | — | Mobile/web have no Crashlytics |
| n8n / Flowise / Qdrant / Ollama | Internal AI stack | Backend | AI URLs | — | `POST /api/app/ai/consult` only |

## Browser-specific

- Payment: hosted checkout / payment link, never native SDK.
- Location: `navigator.geolocation` while the visit/SOS tab is visible.
- Push: Web Push subscription stored additively if backend accepts it; otherwise in-app + flash alerts.
- Camera: `getUserMedia` for telehealth and file input for KYC (no background camera).

## Do not put in the frontend

Gateway secrets, `JWT_SECRET`, `LEAD_INGEST_SECRET`, AWS keys, MSG91 auth key, WhatsApp tokens.
