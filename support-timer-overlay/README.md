# Support Timer Overlay

OBS browser-source overlay for two independent costume timers. Support events can trigger a roulette result that adds or subtracts time from either timer.

## Features

- Two timers: pig costume and boar costume
- 3,900 support amount: roulette adds 20 or 30 minutes
- 4,000 support amount: roulette subtracts 20 or 30 minutes
- Settings page and OBS overlay page are separated
- Recent roulette history and local test support buttons
- Official OAuth/session integration is isolated from future external integrations

## Requirements

- Node.js 20 or newer
- Official developer app credentials
- API Scope: support/donation read scope

## Setup

Install dependencies:

```bash
npm install
```

Create `.env` from the example:

```bash
copy .env.example .env
```

Fill these values in `.env`:

```env
PLATFORM_CLIENT_ID=your_client_id
PLATFORM_CLIENT_SECRET=your_client_secret
PLATFORM_REDIRECT_URI=http://localhost:3000/auth/callback
```

The redirect URI in the developer center must exactly match:

```text
http://localhost:3000/auth/callback
```

## Run

Production-style local run:

```bash
npm run build
npm start
```

Development run:

```bash
npm run dev
```

Pages:

- Settings: http://127.0.0.1:3000/settings
- OBS overlay: http://127.0.0.1:3000/overlay?transparent=1

Recommended OBS browser source size:

```text
1100 x 180
```

## Safety Notes

- Do not commit `.env`.
- Do not commit `server/data/tokens.json`.
- Do not put official service names directly in the package name or app name.
- Other users should create their own developer app credentials.
