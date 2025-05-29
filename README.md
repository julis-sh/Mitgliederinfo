# Mitgliederinfo

## Überblick

Webanwendung zur Mitgliederverwaltung inkl. automatischem Mailversand (Microsoft 365), Empfänger- und Template-Management sowie CI/CD-Deployment. Design nach CD der Jungen Liberalen.

---

## Features

- Authentifizierung (JWT)
- Mitgliederverwaltung (Eintritt, Austritt, Änderung)
- Empfänger-Management (UI/DB)
- Mail-Templates (UI-editierbar, Anhänge möglich)
- Automatischer Mailversand via Microsoft 365
- CI/CD mit GitHub Actions
- Modernes UI im JuLi-Style

---

## Projektstruktur

- `frontend/` – React-App (Material UI, Custom Theme)
- `backend/` – Node.js/Express-API (MariaDB)
- `.github/workflows/` – CI/CD-Pipelines

---

## Schnellstart

### Voraussetzungen

- Node.js (>=18)
- MariaDB (lokal oder remote)

### Lokales Setup

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## Umgebungsvariablen (Beispiel `.env` Backend)

```
CLIENT_ID=...
CLIENT_SECRET=...
TENANT_ID=...
SENDER_MAIL=...
DB_HOST=localhost
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
JWT_SECRET=...
MS_ALLOWED_DOMAIN=@julis-sh.de
MS_ALLOWED_USERS=alice@julis-sh.de,bob@julis-sh.de # Kommagetrennte Whitelist, optional
MS_CLIENT_ID=... # Microsoft App Client ID
MS_TENANT_ID=... # Microsoft Tenant ID
```

---

## Microsoft 365 App-Registrierung (Mailversand & SSO)

1. Azure Portal: App-Registrierung anlegen (Single Tenant, Redirect-URI: `http(s)://<deine-domain>/login`)
2. API-Berechtigung: Microsoft Graph > `Mail.Send` und `openid`, `profile`, `email`
3. Zertifikate & Geheimnisse: Neuen Clientschlüssel anlegen
4. Werte in `.env` im Backend und Frontend eintragen
   - Frontend: `.env` → `VITE_MS_CLIENT_ID=...`, `VITE_MS_TENANT_ID=...`
   - Backend: `.env` → wie oben
5. Nur User mit Domain `@julis-sh.de` (oder wie in `MS_ALLOWED_DOMAIN` gesetzt) können sich via SSO anmelden. Wenn `MS_ALLOWED_USERS` gesetzt ist, sind nur diese Accounts erlaubt.

---

## API-Beispiel (cURL)

```bash
curl -X POST http://localhost:5000/api/members \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Max Mustermann", "email": "max@beispiel.de"}'
```

---

## Testing & Linting

- Backend: `npm run test` (Jest)
- Frontend: `npm run test` (Jest/React Testing Library)
- Linting: `npm run lint`
- Formatierung: `npm run format`

---

## Contribution

1. Forken & Branch anlegen
2. Änderungen committen (konventionelle Commits)
3. Pull Request stellen

---

## Deployment

- Nginx als Reverse Proxy (HTTPS)
- CI/CD via GitHub Actions (SSH-Deploy)
- Health-Check-Endpoint: `/api/health`

---

## Troubleshooting

- Prüfe `.env`-Dateien und DB-Verbindung
- Logs: `backend/logs/` und `frontend/*.log`
- Bei Problemen: Issues im Repo anlegen

---

## Lizenz

MIT
