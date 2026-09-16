# Parity Architecture

How `ariesxpertv2` (Flutter) and `Aries-PhysioCare-Parity-App` (web/PWA) share one identity, one API, and one source of truth.

## Product boundary

AriesXpertV2 is a **therapist-only** field application. The parity web app is the browser/PWA counterpart of that same expert product. It is not a patient portal and not the HQ admin console.

| Interface | Repository | Audience | Auth |
|---|---|---|---|
| Mobile | `ariesxpertv2` | Experts / field providers | JWT Bearer (`jwt_token`) |
| Web / PWA | `Aries-PhysioCare-Parity-App` | Same experts on laptop/tablet/browser | Same JWT, httpOnly session cookie + in-memory cache |
| Admin | `AriesXpert-Admin-Dashboard` | HQ / ops / finance | Separate admin JWT |
| Marketing sites | `AriesXpert-Website-*` | Public patients / SEO | Public catalog + lead ingest |

```
                 ┌──────────────────────┐
                 │   Expert account     │
                 │   User + Therapist   │
                 └──────────┬───────────┘
                            │
                 SAME IDENTITY / JWT
                            │
           ┌────────────────┴────────────────┐
           │                                 │
   AriesXpertV2                    Aries-PhysioCare-
    Flutter app                      Parity-App
           │                                 │
           └────────────────┬────────────────┘
                            │
                 ariesxpert-backend
                 https://api.ariesxpert.com
                            │
                 MongoDB (clinical / ops)
                 Redis + Socket.io
                 S3 documents
```

## Request path

Flutter calls the backend origin directly:

`https://api.ariesxpert.com/api/app/expert/refreshUser`

The browser cannot do that without CORS friction, so the web app issues a **same-origin** request and a Next.js route handler forwards it verbatim:

```
Browser  →  /api/app/expert/refreshUser
Next BFF →  https://api.ariesxpert.com/api/app/expert/refreshUser
Mongo    ←  same handler Flutter uses
```

Proxies:

- `src/app/api/app/[...path]/route.ts` → `/api/app/*`
- `src/app/api/admin/[...path]/route.ts` → `/api/admin/*`
- `src/app/api/v1/[...path]/route.ts` → `/api/v1/*`
- `src/app/api/backend/[...path]/route.ts` → backend root (e.g. `POST /attendance`)
- `src/app/api/session/route.ts` → sets/clears the httpOnly JWT cookie

The path, method, JSON body, and `Authorization` header that reach Express are byte-identical to mobile.

## Authentication

1. Expert logs in with phone OTP (`sendOrResendOTPtoUser` + `verifyOTPofUser`) or email/password (`loginFromEmail`).
2. Backend returns a JWT and the expert/Therapist document.
3. Web stores the JWT in an **httpOnly cookie** (BFF session) and a short-lived memory cache. `localStorage` is only a migration fallback.
4. Subsequent API calls send `Authorization: Bearer <jwt>`. The proxy also forwards the session cookie upstream if the header is missing.
5. `refreshUser` reloads the Mongo expert record. Onboarding progress (`onboardingStep`, `onboardingStatus`, `isProfileActive`) is server-authoritative, so a user can start on mobile and continue on desktop.

Firebase is used by mobile for FCM and custom tokens. **Provider identity is not Firebase Auth.** The web app must not create a second login plane.

## Authorization

The expert JWT identifies a therapist. Mobile RPCs (`/api/app/*`) assume that persona. The web app never calls admin-only mutations except the few Flutter already calls (wallet withdrawal, flash-alert click, packages, mobile-config, finance pricing resolve).

Clinical notes (SOAP, assessments) are scoped to the authenticated expert’s appointments. Frontend hiding is not authorization — the backend must reject cross-therapist reads.

## Real-time

Socket.io on the same backend origin.

- Root namespace: join `therapist-{id}` via `join_therapist_room`.
- Events: `new_broadcast`, `lead_approved`, `therapist_wallet_update`, `payment_success`, `new_flash_alert`, `peer_sos_alert`, `sos_backup_dispatch`, `therapist_status_changed`.
- Chat namespace `/chats`: `join_chat`, `send_message`, `new_message`.

The socket is a **change signal**. REST remains the source of truth. Pages refetch the affected resource on event.

## Documents

KYC and visit proofs are uploaded as multipart to the same expert endpoints Flutter uses. Files land in S3. The web app previews via authenticated/proxied URLs — never assume a permanent public object URL for PHI/PII.

## Payments

Authoritative state is webhook-driven on the backend (Razorpay / Cashfree). Web uses hosted checkout or payment links, then `verifyCashfreeTransaction` / `GET /api/app/payments/status/{orderId}`. The UI never marks a payment successful from client-only input.

Wallet balances, visit earnings, and withdrawals come from `/api/app/wallet/*` and ledger collections. Clients do not compute payout totals independently.

## Onboarding

Server fields: `onboardingStep` (0–5), `onboardingStatus`, `status` (`Draft|Incomplete|Pending|Approved|Rejected|Suspended`), `isOnboardingPaid`, `isProfileActive`.

Steps: Country → Personal/KYC → Professional → Banking → Service area → Registration fee / submit for review.

Admin dashboard approves the same `Therapist` document. Both clients resume from `checkOnboardingStatus`.

## What we will not duplicate

- A second Mongo database
- A patient auth module (out of product scope)
- Independent appointment-status machines
- Marketing-site Firebase patient portal
- Native-only capabilities without a documented browser equivalent (DUIX NCNN, always-on GPS service, contact sync, overlay windows)

## Environment

| Variable | Role |
|---|---|
| `BACKEND_API_BASE_URL` | Bare origin (`https://api.ariesxpert.com`); `/api` suffix is stripped |
| `NEXT_PUBLIC_API_URL` | Public alias of the same origin (browser still goes same-origin) |
| `NEXT_PUBLIC_APP_VERSION` | Build metadata for troubleshooting |

Secrets (JWT signing, MSG91, gateway keys, S3) live only on `ariesxpert-backend`. They are never put in frontend env vars.
