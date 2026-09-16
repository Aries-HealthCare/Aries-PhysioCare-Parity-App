# AriesXpertV2 → Web Parity Matrix

Statuses: DISCOVERED | NOT IMPLEMENTED | PARTIAL | IMPLEMENTED | PLATFORM-SPECIFIC | BACKEND-LIMIT

| Domain | Feature | Status | API | Web route |
|---|---|---|---|---|
| Auth | Splash / session restore | IMPLEMENTED | refreshUser, autoLogin | `/login` |
| Auth | Phone OTP login | IMPLEMENTED | sendOrResendOTPtoUser, verifyOTPofUser | `/login`, `/verify` |
| Auth | Email/password login | IMPLEMENTED | loginFromEmail | `/login` |
| Auth | Email OTP | IMPLEMENTED | sendEmailOTP, verifyEmailOTP + autoLogin | `/login` |
| Auth | Forgot / reset password | IMPLEMENTED | forgotPassword, sendPasswordResetOTP, resetPassword | `/login`, `/reset-password` |
| Auth | Logout | IMPLEMENTED | local + cookie clear | `/login` |
| Auth | Biometric lock | PLATFORM-SPECIFIC | — | session timeout |
| Onboarding | 6-step KYC wizard | IMPLEMENTED | addPersonalInfo, addProfessionalInfo, addBankInfo, addAreaOfServiceInfo, submitForReview | `/onboarding` |
| Onboarding | Registration fee | IMPLEMENTED | createTransaction, verifyCashfreeTransaction (polled) | `/onboarding` |
| Onboarding | Status / resume | IMPLEMENTED | checkOnboardingStatus, onboardingStep | `/onboarding-status` |
| Onboarding | Product tour | IMPLEMENTED | updateOnboardingTour | `/app` overlay |
| Dashboard | KPIs + drill-downs | IMPLEMENTED | home stats | `/app`, `/app/dashboard/*` |
| Leads | Broadcast accept/pass + realtime | IMPLEMENTED | fetchBroadcastlisting, markAsInterestedOrNot, socket | `/app/leads` |
| Appointments | List/detail/create/reschedule | IMPLEMENTED | appointment RPCs | `/app/appointments` |
| Appointments | Cancel | BACKEND-LIMIT | removed | — |
| Visits | Field engine + timer + QR/proof | IMPLEMENTED | validate-arrival, assessment, generate-qr, payment-proof, finalize | `/app/visits` |
| Visits | Background GPS / geofence auto-end | PLATFORM-SPECIFIC | — | tab geolocation |
| Map | Live map hub | IMPLEMENTED | google-maps/mobile-config | `/app/map` |
| Telehealth | In-page Agora | IMPLEMENTED | start/end-telehealth | `/app/telehealth` |
| Patients | Registry/detail/refer/invoice | IMPLEMENTED | patient RPCs | `/app/patients` |
| Chat | Threads + messages | IMPLEMENTED | /api/v1/chats | `/app/chat` |
| Wallet | Balance, withdraw, earnings, invoices | IMPLEMENTED | wallet / payments | `/app/wallet` |
| Documents | KYC vault | IMPLEMENTED | profile document URLs | `/app/documents` |
| Profile | Digital ID | IMPLEMENTED | refreshUser | `/app/profile/digital-id` |
| Availability | Duty + service area | IMPLEMENTED | isTherapistActive, addAreaOfServiceInfo | `/app/availability` |
| Availability | Weekly roster | BACKEND-LIMIT | — | — |
| Attendance | Punch | BACKEND-LIMIT | none | `/app/attendance` |
| Notifications | Inbox + flash overlay + browser notify | IMPLEMENTED | notifications, flash-alerts, Notification API | shell |
| Settings | Channels, quiet hours, privacy, language | IMPLEMENTED | expert settings RPCs + local locale | `/app/settings` |
| SOS | Start/location/resolve | IMPLEMENTED | /api/app/sos/* | `/app/sos` |
| Buddy | Chat / missions | IMPLEMENTED | /api/app/buddy/* | `/app/buddy` |
| AI | Consult | IMPLEMENTED | /api/app/ai/consult | `/app/ai` |
| AI | DUIX NCNN avatar | PLATFORM-SPECIFIC | native | — |
| Gaming | Tournament, coins, quizzes, tasks | IMPLEMENTED | /api/app/gaming/* | `/app/gaming` |
| Quality / rewards / training / support / referrals | IMPLEMENTED | matching `/api/app` RPCs | `/app/*` |
| PWA | Manifest + app-shell SW | IMPLEMENTED | — | `/sw.js` |
| Security | httpOnly session cookie | IMPLEMENTED | `/api/session` | all |

## Platform-specific (not silent gaps)

- DUIX NCNN talking avatar
- Android foreground GPS / geofence auto-end
- Overlay windows, contact sync, dynamic icon, app badge, biometric lock
- Native Cashfree/Razorpay SDKs (hosted checkout instead)
- Exotel overlay

## Backend limits (both clients)

- No attendance module
- No weekly shift calendar
- No expert appointment-cancel RPC
- Patient model has no login
