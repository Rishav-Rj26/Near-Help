# NearHelp

NearHelp is a hyperlocal, real-time emergency response platform that connects people in crisis directly with trained community responders before official services arrive. By leveraging geospatial matching, live WebSockets, and an AI crisis assistant, it triages incidents instantly and guides responders with actionable, on-the-ground intelligence.

> **Portfolio demo, not an emergency-services replacement.** In a real emergency, contact local emergency services first. NearHelp's AI guidance is informational and must never replace professional direction.

## Tech Stack
- **Frontend**: React, React-Leaflet (Mapbox/Carto layers), Stitches (styling)
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB (with 2dsphere indexing for geospatial queries)
- **AI Integration**: Google Gemini 1.5 Flash (via `@google/genai` SDK)

## What makes the live loop reliable

1. A signed-in broadcaster triggers an SOS with location, incident type, radius, and optional anonymity.
2. The server validates the request, prevents duplicate alerts, applies a per-user cooldown, then stores the incident with a geospatial index.
3. Nearby connected responders receive the incident instantly through Socket.io and may opt in to respond.
4. A private responder thread supports live chat and location sharing; the server verifies membership before either is accepted.
5. Resolution records the outcome and opens a debrief flow, while AI summaries and nearby services are generated without blocking the initial SOS alert.

## Engineering safeguards

- JWT-protected REST and Socket.io access, with server-side authorization checks.
- Coordinate bounds checks, payload-size limits, input validation, and authentication rate limiting.
- Security response headers, CORS allow-listing, request IDs, and a `GET /health` readiness endpoint.
- Anonymous incidents redact reporter identity for non-owners.
- Automated validation tests and GitHub Actions checks on pushes and pull requests.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Google Gemini API Key

### 1. Backend Setup
Navigate to the `backend` directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:
```
PORT=3001
MONGO_URI=mongodb://localhost:27017/nearhelp
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

Start the backend development server:
```bash
npm run dev
```

Verify the service is ready at `http://localhost:3001/health` and run its test suite with `npm test`.

### 2. Frontend Setup
Navigate to the `frontend` directory and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file based on `.env.example`:
```
VITE_API_URL=http://localhost:3001/api
```

Start the frontend development server:
```bash
npm run dev
```

Create a production build with `npm run build`.

## Production checklist

Before exposing NearHelp to real people, provide a managed MongoDB deployment, rotate secrets, configure a precise production `FRONTEND_URL`, and use a durable distributed rate limiter and Socket.io adapter. A genuine emergency service also needs verified responder onboarding, incident operations, abuse reporting, privacy/legal review, accessibility audits, and 24/7 human escalation—not just application code.

## Admin & Demo Tools

**Reset Demo Data**
To wipe all incidents and chat messages while preserving users and emergency services (perfect for starting a clean demo):
```bash
cd backend
node src/scripts/resetDemoData.js
```

**Promote a User to Admin**
To access the Admin Dashboard at `/admin`, you need to promote an existing user:
```bash
cd backend
node src/scripts/makeAdmin.js <user-email>
```

## How to Test the Live Loop

To simulate a real emergency response loop locally:
1. Open two separate browser windows (e.g., standard Chrome and Incognito Chrome).
2. Create two distinct accounts: "Broadcaster" and "Responder".
3. **Trigger SOS**: As the Broadcaster, tap the SOS button and submit a crisis.
4. **Responder View**: As the Responder, you will instantly see a pulsing red pin appear on your map. Click it and tap "Join as Responder".
5. **Live Action**: 
   - Both windows will now see the AI-generated triage and guidance card.
   - The Broadcaster will see the Responder's live location dot moving on the map.
   - You can chat in real-time using the embedded chat thread.
6. **Resolution**: The Broadcaster resolves the incident, triggering a Debrief modal.
