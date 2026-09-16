# Domain Model

Entities that both AriesXpertV2 and the parity web app read/write. Source: `ariesxpert-backend` Mongoose/TypeGoose models. This is not a new schema.

## Identity

### User (`users`)

Login account linked to a therapist.

- `firstName`, `lastName`, `email`, `password` (bcrypt)
- `phone` / `mobile`
- `role` (string, default `therapist`)
- `isActive`, `isVerified`, `email_verified`, `mobile_verified`
- `fcmToken`, lockout (`failedLoginAttempts`, `lockedUntil`)
- `geography` `{ country, state, city, area }`
- `staffType` / HQ fields exist for admin users; expert app does not use them

### Therapist / Expert (`therapists`)

Operational provider record. `userId → User`.

- Identity & KYC: name, gender, DOB, address, country-specific IDs (Aadhaar, NI, SSN, Emirates ID, Personalausweis, CA photo ID), profile photo
- `professionalInfo`: role, qualification, specializations, certifications, license/council, clinic ownership, documents
- `bankInfo`: account, IFSC/UPI/IBAN/sort/routing, cancelled cheque, verification status
- `areaOfServiceInfo`: city, areas, pincodes, radius, commute, urgent visits, travel window, driving license
- Lifecycle: `status` `Draft | Incomplete | Pending | Approved | Rejected | Suspended`
- `onboardingStep`, `onboardingStatus`, `isOnboardingPaid`, `isProfileActive`
- Duty flags: `isTherapistActive`, `isTherapistSOS`, `isProfileVisible`, `isActivityTracking`
- `axId` / `ariesId`, `showOnWebsite`, `websiteVisibility`
- Wallet ref, commission rate, FCM, telehealth flags
- Notification preferences and quiet hours
- Targets, badges, QA scores (often nested `therapistProfile`)

### Session (`sessions` / UserSession)

Refresh tokens for OTP/session rotation (access ~15m on therapist OTP path, refresh ~7d). Web and mobile share the same JWT secret.

### OTP record

MSG91 OTP challenges for expert login and password reset.

## Clinical / operations

### Patient (`patients`)

CRM entity, **not a login account**. No `userId`/password.

- Demographics, address, emergency contact
- `status`: `Active | Inactive | Pending | Discharged | On-Hold`
- `stage`: `Patient | Lead`
- `assignedTherapist`, `clinicId`, `countryIso`
- medical conditions, investigation report URLs, `activePackageId`

Experts fetch **their** patients via `POST /api/app/patient/fetchPatients`.

### Appointment (`appointments`)

A visit **is** an appointment. There is no separate Visit collection for the expert workflow.

- `patient`, `therapist`
- `appointmentDate`, `appointmentTime` (mobile sends `DD/MM/YYYY`)
- `visitType`: `home_visit | telehealth | clinic_visit | First Visit | Regular Visit | clinic`
- `appointmentStatus`: `Scheduled | ReScheduled | Confirmed | InProgress | Completed | Cancelled | NoShow` (JSON also uses `pending`, `scheduled`, `in_progress`, `missed`)
- `paymentStatus`: `Pay Later | Collected | pending | paid | partial | PENDING_VERIFICATION`
- session amount, address, clinic, country, currency
- `checkInTime`, `checkOutTime`, `arrivedAt`, `arrivalValidated`
- SOAP (encrypted on backend), telehealth room fields
- payment method / payment image (cash proof)

### AIVisitTracking (`ai_visit_tracking`)

GPS vs patient location, OTP check-in, breadcrumbs, fraud flags. Used by `/api/visit-tracking`.

### Assessment / AssessmentResponse

Dynamic clinical forms and submitted answers, tied to `appointmentId` + expert + patient.

### Treatment / TreatmentType

Catalog of treatments the expert can attach to a visit.

### Lead / BroadcastListing

Ops-created case broadcasts. Experts mark interested / not interested. Conversion to appointment is admin/AI matching — not a patient self-serve checkout.

### SlotHold

`HELD | CONFIRMED | RELEASED | EXPIRED` — WhatsApp/webchat holds. Expert app does not create these directly.

## Money

### Wallet

`pendingBalance`, `locked`, `available`, liability, currency.

### WalletTransaction

`CREDIT | DEBIT`. Categories include `VISIT_EARNING`, `REFERRAL_BONUS`, `WITHDRAWAL`. Status `completed | pending | reversed`.

### LedgerEntry

Immutable double-entry: `EARNING, COMMISSION, LIABILITY, PAYOUT, GATEWAY_FEE, …`

### Transaction

Onboarding / security-deposit gateway orders (Razorpay/Cashfree).

### PaymentLink / PaymentProof

Hosted links and cash/UPI screenshot verification.

### Payout / PayoutCycle

Cashfree (and adapters) transfers. Cycle `OPEN → CLOSING → LOCKED → PAYING_OUT → CLOSED`.

### Package / PackageSubscription

Session packages with geo and tier. Expert can attach a package on a patient; purchase APIs currently assume therapist auth.

### Invoice

Generated/sent from expert to patient (`sendInvoice`).

## Documents

### FileItem

Admin file manager metadata (S3 URL, Drive id, entity type `therapist|patient|branch|clinic|document`).

KYC files for experts are **embedded URLs** on `Therapist` (aadhaar, certificates, cheque, etc.).

## Communication

### AppNotification

In-app inbox for the expert.

### Chat / ChatMessage (`/api/v1/chats`)

Internal, field-staff, lead, and support threads.

### SupportTicket / FAQ

Helpdesk.

### FlashAlert

HQ broadcasts (`targetAudience=therapists`).

### EmergencyContact / QuickDial

SOS roster.

## Config / geography

### AppConfig / MobileConfig

Remote theme, legal, fees, FAQs, Razorpay key, terms URL, professional roles, service types.

### Clinic

`Owned | Partner | Franchise | Hub`. Experts may own a private clinic flag on professional info.

### Country

Therapist `countryCode` / `countryName`. Supported onboarding: IN, CA, UK, DE, UAE, US.

## Relationships (expert-centric)

```
User 1──1 Therapist
Therapist 1──* Appointment ──1 Patient
Therapist 1──* WalletTransaction
Therapist 1──* AssessmentResponse
Therapist 1──* AppNotification
Appointment 1──0..1 AIVisitTracking
Appointment 1──* PaymentProof
Lead ──broadcast──> BroadcastListing ──interest──> Therapist
Admin approval writes Therapist.status (same document both clients read)
```

## IDs

The same Mongo `_id` is the appointment/patient/therapist id on both clients. Do not invent `webAppointmentId` mappings.

## Out of this model

There is no Patient User with credentials in this backend. Website booking creates a **Lead**, not an Appointment. That is intentional and out of therapist-parity scope.
