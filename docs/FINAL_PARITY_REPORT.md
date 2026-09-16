# Final Parity Report

Date: 2026-09-17  
Product: Aries-PhysioCare-Parity-App as the web/PWA counterpart of AriesXpertV2 (therapist-only).

## 1. Architecture summary

Both clients are thin views over `ariesxpert-backend` (`https://api.ariesxpert.com`). Expert identity is a JWT issued by `/api/app/expert/*`. The browser uses same-origin Next proxies plus an httpOnly `ax_expert_session` cookie. Socket.io room `therapist-{id}` is the change signal; REST is the source of truth. There is no second database.

## 2. Feature coverage

Discovered Flutter expert modules: auth, onboarding, dashboard KPIs, leads, appointments, visits, patients, wallet, earnings, invoices, documents, profile, digital ID, availability, attendance (backend-limit), notifications, flash alerts, SOS, buddy, AI consult, gaming, quality, rewards, training, support, referrals, chat, live map, settings, emergency contacts.

Implemented or integrated on web: all of the above except native-only capabilities in §10.

## 3. Screen coverage

See `docs/ARIESXPERT_PARITY_MATRIX.md`. Routes include `/onboarding-status`, `/reset-password`, `/app/chat`, `/app/map`, `/app/ai`, `/app/more`, `/app/profile/digital-id`, `/app/settings/emergency`, dashboard drill-downs, in-browser Agora, PWA service worker, collapsible desktop nav, and a 6-step product tour.

## 4. API coverage

See `docs/API_PARITY_MAP.md`. Client methods cover auto-login, email OTP, password reset (email OTP + token), chats, maps config, flash alerts, AI consult, payment proof, onboarding fee verify with polling, gaming quizzes/tasks.

## 5. Data synchronization

Identical paths and bodies as Flutter `ApiService`. Realtime refetch on socket events. Onboarding `onboardingStep` / `onboardingStatus` are server-authoritative.

## 6. Authentication

Phone OTP, email/password, and email OTP (verifyEmailOTP then autoLogin). Session cookie BFF + localStorage migration fallback. Logout clears cookie and tokens and does not revoke mobile sessions. `/verify` no longer accepts master OTPs or fake success.

## 7. Role and permission coverage

Single persona: authenticated expert. Professional roles come from the therapist record. Admin HQ remains `AriesXpert-Admin-Dashboard`. No patient portal.

## 8. Integration coverage

Cashfree/Razorpay hosted checkout with verify polling. Agora in-browser with meet-link fallback. Google Maps via navigate URLs + backend maps config. Browser Notification API for background-tab alerts (FCM web tokens are optional later). DUIX NCNN is platform-specific.

## 9. Testing

Unit tests: visit status mapping, session path guards, envelope unwrap, onboarding routing, i18n labels.  
E2E scaffold: Playwright `tests/e2e/login.spec.ts`.  
Cross-app sync is guaranteed by shared Mongo IDs; live dual-client verification still needs staging credentials.

## 10. Remaining platform-specific differences

- On-device DUIX talking avatar
- Android foreground GPS / geofence auto-end visit
- Overlay windows, contact sync, dynamic launcher icon, app badge, biometric lock
- Native Cashfree/Razorpay SDKs (hosted checkout instead)
- Exotel in-app overlay
- Attendance punch (backend has no module)
- Weekly shift roster (not modelled)
- Expert appointment cancel RPC (removed BACK-013)

## 11. Security review

- httpOnly session cookie; proxy injects Bearer from cookie
- No `Access-Control-Allow-Origin: *` on `/api/*`
- Verify page no longer bypasses OTP
- Clinical payloads excluded from the service worker
- Remaining: XSS surface of `localStorage` fallback until all sessions are cookie-only

## 12. Performance

Grouped collapsible sidebar, route-level pages, `optimizePackageImports`, PWA app-shell cache only. Agora SDK is dynamically imported.

## 13. Migration changes

No Mongo schema changes. Additive web session cookie only.

## 14. Known limitations

- Unused marketing/Firebase/Genkit source files may still exist on disk but are excluded from the live app shell
- Playwright is not a required CI package until `@playwright/test` is installed
- `eslint.ignoreDuringBuilds` remains true because ESLint is not a production dependency of this app
- Closed-tab web push still needs a VAPID/FCM web config; open-tab and background-tab Notification API are live

## 15. Production readiness

Set `BACKEND_API_BASE_URL=https://api.ariesxpert.com`. Deploy `app.ariesphysiocare.com`. Do not put JWT_SECRET, MSG91, or gateway keys in this app. Run `npm run typecheck` and `npm test` before release.
