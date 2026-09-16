# Aries-PhysioCare-Parity-App

Web/PWA counterpart of **AriesXpertV2** for verified field experts (`app.ariesphysiocare.com`).

Same identity, same `ariesxpert-backend`, same Mongo documents as the Flutter app. Not a patient portal and not the HQ admin console.

## Docs

- [Parity architecture](docs/PARITY_ARCHITECTURE.md)
- [Feature matrix](docs/ARIESXPERT_PARITY_MATRIX.md)
- [API map](docs/API_PARITY_MAP.md)
- [Domain model](docs/DOMAIN_MODEL.md)
- [User journeys](docs/USER_JOURNEYS.md)
- [Integrations](docs/INTEGRATIONS.md)
- [Mobile sync rules](docs/MOBILE_PARITY_SYNC.md)
- [Final report](docs/FINAL_PARITY_REPORT.md)

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

```bash
npm test
npm run typecheck
npm run build
```
