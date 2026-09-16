# User Journeys — Expert personas

Personas are `ProfessionalRole` values from AriesXpertV2, not invented RBAC roles:

- Physiotherapist
- Occupational Therapist
- Dietician / Nutritionist
- Speech Therapist
- Vision Therapist
- Nurse
- Care Taker / Attendant

Dashboard KPI labels differ by role (`DashboardConfig.roleConfigs`); APIs do not. Access is “authenticated expert whose Therapist row is approved / in onboarding”.

## 1. First-time registration (web or mobile)

1. Open `/login` (or Flutter splash → login).
2. Select country. Enter mobile. `POST /api/app/expert/sendOrResendOTPtoUser`.
3. Verify OTP. JWT issued. If no complete profile, `onboardingStep` is 0.
4. Country (if not already) → Personal + KYC docs → Professional + licenses → Banking → Service area → Registration fee hosted checkout → `submitForReview`.
5. Land on `/onboarding-status` until Admin sets `Approved`.
6. Same Mongo progress is visible if the user switches device and logs in again.

## 2. Existing expert login on another device

1. Email/password or OTP.
2. `refreshUser` / `checkOnboardingStatus`.
3. If `onboardingStep < 5` and not `isProfileActive`, resume wizard at the stored step.
4. If approved, enter `/app` dashboard.
5. Do not mint a local user. Empty expert document = failed login.

## 3. Password recovery

1. Login → reset screen.
2. `forgotPassword` / `sendPasswordResetOTP` → `verifyPasswordResetOTP` → `resetPassword`.
3. Sign in with the new password. Mobile sessions remain valid unless backend revokes them (current expert logout is local token clear).

## 4. Duty on, take a lead, complete a home visit

1. Toggle duty (`isTherapistActive`).
2. Live lead stream (`fetchBroadcastlisting`). Socket `new_broadcast`.
3. Express interest or pass.
4. On `lead_approved`, appointment appears in `/app/appointments`.
5. Start visit: navigate (maps) → `validate-arrival` with GPS → treatment timer → assessment form → payment (cash / UPI QR / online) → `finalize` → optional `referral-earning`.
6. Wallet updates via `therapist_wallet_update`.

## 5. Create appointment from therapist (known patient)

1. Patients registry → select patient (or refer new patient).
2. `createAppointmentFromTherapist` with visit type, date `DD/MM/YYYY`, time, address.
3. Appointment shows on mobile and web with the same `_id`.

## 6. Reschedule

1. Appointment detail → reschedule dialog.
2. `rescheduleAppointment`. Status becomes `ReScheduled`.
3. Cancel is **not** a mobile API (BACK-013). Web must not invent patient cancel.

## 7. Telehealth session

1. Upcoming telehealth appointment → `start-telehealth`.
2. Join Agora room in-browser (web) or native (mobile).
3. Submit assessment `PUT .../assessment`.
4. `end-telehealth`.

## 8. Refer a patient / colleague

1. Refer patient form → `createReferPatient` (10% earning path after completed visit).
2. Refer therapist → `createReferTherapist`.
3. Trackers read `fetchReferPatients` / `fetchReferTherapist`.

## 9. Wallet withdrawal

1. Wallet shows `my-wallet` balances (pending/available).
2. Request withdrawal → `POST /api/admin/wallet/request-withdrawal` (same path Flutter uses).
3. Admin payout cycle pays out. Do not compute available balance in the client.

## 10. SOS

1. Hold SOS. Countdown. `POST /api/app/sos/start` with coordinates.
2. Location patches while the tab is open.
3. Resolve with PIN. Peer alerts via socket.
4. Browser cannot run an always-on GPS service; show that limitation instead of faking checkout.

## 11. Support

Create ticket / browse FAQs / in-app chat with support (`/api/v1/chats` + `/api/app/support-chat`).

## 12. Gaming / Buddy / AI

Optional growth features on the same expert JWT:

- Arena: profile, coins, quizzes, tournaments
- Buddy: chat + missions
- AI consult: `POST /api/app/ai/consult` with history

Native DUIX talking-avatar is platform-specific; web uses Buddy text and LiveKit avatar only if the backend session succeeds.

## Empty / error / loading

Every journey must distinguish:

- Loading (skeleton)
- Empty (no appointments yet → CTA if role permits)
- Error (backend unreachable — never a fake list)
- Success (server-confirmed)
