# Aries-PhysioCare-Parity-App

Clinical Provider Parity Web Application for **Aries PhysioCare** (`app.ariesphysiocare.com`).

## Architecture & Features

- **Subdomain**: Dedicated PWA running on `app.ariesphysiocare.com`.
- **23 Parity Modules**:
  - `Appointments` (`/app/appointments`)
  - `Attendance & Check-in` (`/app/attendance`)
  - `Availability & Calendar` (`/app/availability`)
  - `Buddy System` (`/app/buddy`)
  - `Document Vault & KYC` (`/app/documents`)
  - `Earnings Breakdown` (`/app/earnings`)
  - `Gaming & Challenges` (`/app/gaming`)
  - `Invoices & Billing` (`/app/invoices`)
  - `Live Patient Broadcast Leads` (`/app/leads`)
  - `Clinical Notifications` (`/app/notifications`)
  - `Patients Registry` (`/app/patients`)
  - `Provider Profile & AI Studio` (`/app/profile`)
  - `Quality & Audit Metrics` (`/app/quality`)
  - `Refer a Patient` (`/app/refer-patient`)
  - `Referral Tracker` (`/app/referrals`)
  - `Rewards & Milestones` (`/app/rewards`)
  - `Account Settings` (`/app/settings`)
  - `Emergency SOS Dispatch` (`/app/sos`)
  - `Clinical Helpdesk & Support` (`/app/support`)
  - `Telehealth Video Consults` (`/app/telehealth`)
  - `Clinical Training Modules` (`/app/training`)
  - `Field Visit Execution & Geo-tracking` (`/app/visits`)
  - `IMPS Payout Wallet` (`/app/wallet`)
- **Authentication & Multi-Country Onboarding**:
  - Phone OTP / Email Login (`/login`)
  - 5-Stage Mobile Parity Onboarding (`/onboarding`) with State Council verification and IMPS banking.

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run typecheck
npm run build
```
