# API Parity Map

Feature → mobile path → web path → backend handler → auth → entity → status.

Web always uses the **same path string** as Flutter. The Next BFF only rewrites the host.

Status: DISCOVERED | PARTIAL | IMPLEMENTED | PLATFORM-SPECIFIC | BACKEND-LIMIT

## Auth / expert

| Feature | Mobile / Web API | Backend | Auth | Entity | Status |
|---|---|---|---|---|---|
| Send mobile OTP | `POST /api/app/expert/sendOrResendOTPtoUser` | expert module | public | otpRecord | IMPLEMENTED |
| Verify mobile OTP | `POST /api/app/expert/verifyOTPofUser` | expert module | public | User, Therapist, JWT | IMPLEMENTED |
| Email login | `POST /api/app/expert/loginFromEmail` | expert module | public | User, Therapist, JWT | IMPLEMENTED |
| Auto login | `POST /api/app/expert/autoLogin` | expert module | public | User | PARTIAL |
| Email OTP send/verify | `POST /api/app/expert/sendEmailOTP`, `verifyEmailOTP` | expert module | public | User | PARTIAL |
| Email verification | `requestEmailVerification`, `checkEmailVerificationStatus` | expert module | public | User | PARTIAL |
| Forgot / reset password | `forgotPassword`, `sendPasswordResetOTP`, `verifyPasswordResetOTP`, `resetPassword` | expert module | public | User | PARTIAL |
| Refresh profile | `POST /api/app/expert/refreshUser` | expert module | JWT | Therapist | IMPLEMENTED |
| Onboarding status | `POST /api/app/expert/checkOnboardingStatus` | expert module | JWT/public | Therapist | IMPLEMENTED |
| FCM token | `PUT /auth/fcm-token` | auth compatibility | JWT | User | PLATFORM-SPECIFIC (web-push additive) |
| Logout | local token clear (no expert logout RPC) | — | — | Session | IMPLEMENTED |

## Onboarding / profile

| Feature | API | Entity | Status |
|---|---|---|---|
| Personal + KYC | `POST /api/app/expert/addPersonalInfo` multipart | Therapist | IMPLEMENTED |
| Professional | `POST /api/app/expert/addProfessionalInfo` | Therapist | IMPLEMENTED |
| Banking | `POST /api/app/expert/addBankInfo` | Therapist | IMPLEMENTED |
| Service area | `POST /api/app/expert/addAreaOfServiceInfo` | Therapist | IMPLEMENTED |
| Submit review | `POST /api/app/expert/submitForReview` | Therapist | IMPLEMENTED |
| Edit profile | `POST /api/app/expert/editProfile` | Therapist | IMPLEMENTED |
| Portrait | `generate-portrait`, `refresh-portrait` | Therapist | PARTIAL |
| Onboarding tour | `POST /api/app/expert/updateOnboardingTour` | Therapist | PARTIAL |
| Duty / SOS / visibility / tracking | `isTherapistActive`, `isTherapistSOS`, `isProfileVisible`, `isActivityTracking` | Therapist | IMPLEMENTED |
| Notification prefs / quiet hours | `notificationEnableOrDisable`, `updateQuietHours` | Therapist | IMPLEMENTED |
| Monthly target | `POST /api/app/expert/setMonthlyTarget` | Therapist | IMPLEMENTED |
| Contact sync | `POST /api/app/expert/syncContacts` | Therapist | PLATFORM-SPECIFIC |

## Home / KPIs

| Feature | API | Status |
|---|---|---|
| Visit count | `POST /api/app/home/fetchNoOfVisit` | IMPLEMENTED |
| Patients attended | `POST /api/app/home/fetchNoOfPatientAttend` | IMPLEMENTED |
| Leads taken | `POST /api/app/home/fetchLeadsTekenAnalysis` | IMPLEMENTED |
| Missed leads | `POST /api/app/home/fetchMissLeadsAnalysis` | IMPLEMENTED |

## Leads

| Feature | API | Status |
|---|---|---|
| Fetch broadcasts | `POST /api/app/broadcastlisting/fetchBroadcastlisting` | IMPLEMENTED |
| Interested / pass | `PUT /api/app/broadcastlisting/markAsInterestedOrNot` | IMPLEMENTED |

## Appointments / visits

| Feature | API | Status |
|---|---|---|
| Fetch | `POST /api/app/appointment/fetchAppointments` | IMPLEMENTED |
| Create from therapist | `POST /api/app/appointment/createAppointmentFromTherapist` | IMPLEMENTED |
| Reschedule | `POST /api/app/appointment/rescheduleAppointment` | IMPLEMENTED |
| Cancel | removed BACK-013 | BACKEND-LIMIT |
| Validate arrival | `POST /api/app/appointment/:id/validate-arrival` | PARTIAL |
| Finalize | `POST /api/app/appointment/:id/finalize` | IMPLEMENTED |
| Payment proof | `POST /api/app/appointments/:id/payment-proof` | PARTIAL |
| Start/end telehealth | `.../start-telehealth`, `.../end-telehealth` | PARTIAL |
| Telehealth assessment | `PUT /api/app/appointment/:id/assessment` | PARTIAL |
| Payment status | `GET /api/app/appointment/:id/payment-status` | PARTIAL |
| Attendance punch | `POST /attendance` | BACKEND-LIMIT |

## Clinical

| Feature | API | Status |
|---|---|---|
| Fetch assessments | `POST /api/app/assessment/fetchAssessments` | IMPLEMENTED |
| Submit response | `POST /api/app/assessmentResponse/addAssessmentResponse` | IMPLEMENTED |
| Treatments | `POST /api/app/treatment/fetchTreatments` | IMPLEMENTED |

## Patients

| Feature | API | Status |
|---|---|---|
| List | `POST /api/app/patient/fetchPatients` | IMPLEMENTED |
| By id | `GET /api/app/patient/fetchPatientById/:id` | IMPLEMENTED |
| Update | `PUT /api/app/patient/update/:id` | IMPLEMENTED |
| Request review | `POST /api/app/patient/requestReview` | IMPLEMENTED |
| Send invoice | `POST /api/app/patient/sendInvoice` | IMPLEMENTED |
| Refer patient | `POST /api/app/patient/createReferPatient` | IMPLEMENTED |
| Fetch referrals | `POST /api/app/patient/fetchReferPatients` | IMPLEMENTED |
| Referral earning | `POST /api/app/patient/referral-earning` | IMPLEMENTED |
| Refer therapist | `fetchReferTherapist`, `createReferTherapist` | IMPLEMENTED |

## Payments / wallet

| Feature | API | Status |
|---|---|---|
| Create onboarding txn | `POST /api/app/transaction/createTransaction` | PARTIAL |
| Verify Cashfree | `POST /api/app/transaction/verifyCashfreeTransaction` | PARTIAL |
| Generate QR | `POST /api/app/payments/generate-qr` | PARTIAL |
| Payment status | `GET /api/app/payments/status/:orderId` | PARTIAL |
| Gateways config | `GET /api/app/appointments/payments/gateways-config` | PARTIAL |
| Wallet | `GET /api/app/wallet/my-wallet` | IMPLEMENTED |
| Wallet ledger | `POST /api/app/walletTransaction/fetchWalletTransactions` | IMPLEMENTED |
| Withdraw | `POST /api/admin/wallet/request-withdrawal` | IMPLEMENTED |
| Pricing resolve | `GET /api/admin/finance/pricing/resolve` | IMPLEMENTED |
| Packages | `GET /packages?status=Active`, `GET /api/admin/packages` | IMPLEMENTED |

## Notifications / comms

| Feature | API | Status |
|---|---|---|
| Inbox | `POST /api/app/notification/fetchNotifications` | IMPLEMENTED |
| Mark read / all / remove / unread-count | notification module | IMPLEMENTED |
| Flash alerts | `GET /api/admin/flash-alerts/active?targetAudience=therapists` | PARTIAL |
| Chat list/messages | `GET/POST /api/v1/chats`, `GET /api/v1/chats/:id/messages` | NOT IMPLEMENTED (web UI) |
| Support chat | `/api/app/support-chat/*` | PARTIAL |
| WhatsApp template | `POST /whatsapp/messages/template` | PLATFORM-SPECIFIC |
| Exotel | `POST /integrations/exotel/call` | PLATFORM-SPECIFIC |

## SOS / map

| Feature | API | Status |
|---|---|---|
| Start / mine / location / resolve | `/api/app/sos/*` | IMPLEMENTED |
| Quick dials | `POST /api/app/quickDial/fetchQuickDials` | IMPLEMENTED |
| Emergency contacts CRUD | `/api/app/therapistEmergencyContact/*` | PARTIAL (API yes, dedicated UI no) |
| Maps config | `GET /api/app/integrations/google-maps/mobile-config` | NOT IMPLEMENTED (web UI) |
| Live location | `expertLocation` module | PLATFORM-SPECIFIC (tab-foreground only) |

## AI / buddy / avatar / gaming

| Feature | API | Status |
|---|---|---|
| AI consult / history | `POST /api/app/ai/consult`, `GET /api/app/ai/history` | PARTIAL |
| Buddy | `/api/app/buddy/*` | IMPLEMENTED |
| Avatar render / LiveKit | `/api/v1/aeos/...`, `/api/workforce/mobile-bridge/avatar/sync` | PLATFORM-SPECIFIC |
| Gaming | `/api/app/gaming/*` | PARTIAL (shallow UI) |

## Config / support

| Feature | API | Status |
|---|---|---|
| App configs | `POST /api/app/appConfig/getAppConfigs` | IMPLEMENTED |
| Mobile config / legal | `/api/admin/mobile-config` | IMPLEMENTED |
| FAQs | `POST /api/app/faq/fetchFaqs` | IMPLEMENTED |
| Tickets | `createSupportTicket`, `fetchSupportTickets` | IMPLEMENTED |
| Feedback | `/api/app/feedback/*` | IMPLEMENTED |

## Authorization notes

- Expert JWT required on all `/api/app/*` except the public OTP/login/reset paths.
- `/api/admin/*` calls from this app are only those Flutter already makes with the expert token. Do not expand into HQ RBAC.
- Patients have no self-service routes in this map by design.
