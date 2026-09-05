# Mobile ⇄ Web Data Parity & Sync

How `Aries-PhysioCare-Parity-App` (web) stays in step with `ariesxpertv2` (Flutter).

## Principle

Both clients are thin views over one system of record: the `ariesxpert-backend` MongoDB
API at `https://api.ariesxpert.com`. Parity is achieved by calling **the same endpoints
with the same request bodies and reading the same response fields** — not by
re-implementing behaviour. Anything the backend does not return is not shown.

Two rules follow from that, and they are enforced throughout the data layer:

1. **No fabricated data.** A failed request throws (`ApiError`) and the page reports it.
   The app never renders an invented value, a synthetic session, or a "saved"
   confirmation the server did not give. An empty list and an unreachable backend must
   never look the same on screen.
2. **No divergent endpoints.** If the Flutter app posts `{broadcastListingId,
   therapistResponse}` to `PUT /api/app/broadcastlisting/markAsInterestedOrNot`, so does
   the web app. Endpoint drift is what silently desynchronises the two clients.

## Transport

| Concern | Mobile (`api_service.dart`) | Web (`src/services/api-transport.ts`) |
| --- | --- | --- |
| Base | `Environment.apiBaseUrl` | `getBackendOrigin()` (env-var suffix `/api`, `/api/v1` stripped) |
| Auth | `Authorization: Bearer <jwt>` from secure storage | same header, JWT from `localStorage` |
| Timeout | 30s, 1 retry on transport failure | identical |
| 401 | throws, does **not** clear the session | identical |
| Envelope | `{ success, message, result \| data }` | `unwrap()` / `unwrapList()` read the same keys |

The browser cannot call `api.ariesxpert.com` directly (CORS), so every request is issued
same-origin and forwarded verbatim by the Next route handlers:

- `src/app/api/app/[...path]/route.ts` → `/api/app/*`
- `src/app/api/admin/[...path]/route.ts` → `/api/admin/*`
- `src/app/api/v1/[...path]/route.ts` → `/api/v1/*`

The path that reaches the backend is byte-identical to the mobile one.

## Real-time sync

`src/services/provider-socket.ts` is a port of the Flutter `SocketService`. It connects
to the same Socket.io server, joins the same room (`join_therapist_room` →
`therapist-<id>`), and listens for the same events. `ProviderRealtimeProvider` (mounted
in `/app/layout.tsx`) turns those into React subscriptions; pages use
`useRealtimeEvent(...)` to refetch the affected data.

| Event | Backend emitter | Refreshed in the web app |
| --- | --- | --- |
| `new_broadcast` | `adminModule/broadcasts/broadcasts.service.ts` | Leads, dashboard, notifications |
| `lead_approved` | `adminModule/treatments/treatments.service.ts` | Leads, appointments, patients, dashboard |
| `therapist_wallet_update` | `adminModule/finance/wallet.engine.ts` | Wallet, rewards, gaming, dashboard |
| `payment_success` | `adminModule/finance/cashfree.service.ts` | Wallet, appointments, dashboard |
| `new_flash_alert` | `adminModule/flash-alerts/flash-alerts.controller.ts` | Notifications, unread badge |
| `peer_sos_alert` / `sos_backup_dispatch` | `adminModule/sos/sos.gateway.ts` | SOS hub |
| `therapist_status_changed` | `adminModule/therapists/therapists.service.ts` | Duty state |
| `new_message` (`/chats` ns) | `adminModule/chats/chats.gateway.ts` | Chat surfaces |

The socket is the change signal; the REST endpoint remains the source of truth.

## Module → endpoint map

| Module | Endpoint(s) | Mobile counterpart |
| --- | --- | --- |
| Dashboard | `POST /api/app/home/fetchNoOfVisit`, `fetchNoOfPatientAttend`, `fetchLeadsTekenAnalysis`, `fetchMissLeadsAnalysis`, `expert/fetchReferTherapist`, `patient/fetchReferPatients`, `expert/refreshUser` | `DashboardNotifier._loadData()` |
| Monthly target | `POST /api/app/expert/setMonthlyTarget` | `DashboardNotifier.setMonthlyTarget` |
| Leads | `POST /api/app/broadcastlisting/fetchBroadcastlisting`, `PUT .../markAsInterestedOrNot` | `LeadProvider` |
| Appointments | `POST /api/app/appointment/fetchAppointments`, `createAppointmentFromTherapist`, `rescheduleAppointment` | `AppointmentProvider` |
| Visit flow | `POST /api/app/appointment/:id/validate-arrival`, `POST /api/app/assessmentResponse/addAssessmentResponse`, `POST /api/app/appointment/:id/finalize`, `POST /api/app/patient/referral-earning` | `VisitFlowService` |
| Patients | `POST /api/app/patient/fetchPatients`, `fetchPatientById/:id`, `update/:id`, `requestReview`, `sendInvoice` | `PatientProvider` |
| Wallet | `GET /api/app/wallet/my-wallet`, `POST /api/app/walletTransaction/fetchWalletTransactions`, `POST /api/admin/wallet/request-withdrawal` | `PayoutService` |
| Gaming | `POST /api/app/gaming/{profile,enter,submit,set-alias,claim-bonus,buy-coins-from-wallet,withdraw-coins-to-wallet}`, `GET .../leaderboard`, `.../topic-quizzes` | `GamingService` |
| Notifications | `POST /api/app/notification/fetchNotifications`, `PUT .../mark-read/:id`, `POST .../mark-all-read`, `POST .../removeNotification`, `GET .../unread-count` | `NotificationProvider` |
| SOS | `POST /api/app/sos/start`, `GET /api/app/sos/my`, `PATCH /api/app/sos/:id/location`, `POST /api/app/sos/:id/resolve`, `POST /api/app/quickDial/fetchQuickDials`, emergency contacts | `SosService` |
| Telehealth | `POST /api/app/appointment/:id/start-telehealth`, **`PUT`** `/api/app/appointment/:id/assessment`, `POST .../end-telehealth` | `TelehealthService` |
| Buddy | `GET/POST /api/app/buddy/profile`, `POST /api/app/buddy/chat`, `chat/session`, `dashboard`, `mission/complete` | `BuddyService` |
| Settings | `POST /api/app/expert/{notificationEnableOrDisable,updateQuietHours,isProfileVisible,isActivityTracking,isTherapistActive,isTherapistSOS}` | mobile settings screen |
| Support | `POST /api/app/supportTicket/{createSupportTicket,fetchSupportTickets}`, `POST /api/app/faq/fetchFaqs` | `SupportService` |
| Profile / onboarding | `POST /api/app/expert/{sendOrResendOTPtoUser,verifyOTPofUser,loginFromEmail,checkOnboardingStatus,addPersonalInfo,addProfessionalInfo,addBankInfo,addAreaOfServiceInfo,submitForReview,editProfile,refreshUser,generate-portrait}` | onboarding wizard + profile |

## Profile field mapping

`normalizeExpertProfile()` mirrors `UserModel.fromJson`, including the nested
`therapistProfile` document that carries targets, badges and scores
(`monthlyVisitTarget`, `monthlyTargetEarnings`, `badges`, `qaScoreAverage`,
`therapistOpportunityScore`, `cityRankPercentile`, …), the notification/quiet-hours
preferences, and the KYC document URLs. Fields the mobile app displays are therefore
available to the web app from the same record.

## Known platform limits

These are limits of the backend, not of this app — both clients behave the same way:

- **Attendance** — there is no attendance module on the backend. Both clients post to
  `/attendance`; the web app reports the failure instead of showing a successful punch.
- **Weekly shift schedule** — not modelled. Availability is the service-area record
  (pincodes, radius, commute, travel window) plus the duty flag.
- **Assessment forms** — when the backend returns an empty form list the built-in
  clinical templates are used, and this is logged. A transport failure is *not*
  substituted with templates; it surfaces as an error.
