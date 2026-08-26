# NearHelp

NearHelp is a hyperlocal, real-time emergency response platform that connects people in crisis directly with trained community responders before official services arrive. By leveraging geospatial matching, live WebSockets, and an AI crisis assistant, it triages incidents instantly and guides responders with actionable, on-the-ground intelligence.

## Tech Stack
- **Frontend**: React, React-Leaflet (Mapbox/Carto layers), Stitches (styling)
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB (with 2dsphere indexing for geospatial queries)
- **AI Integration**: Google Gemini 1.5 Flash (via `@google/genai` SDK)

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

### 2. Frontend Setup
Navigate to the `frontend` directory and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file based on `.env.example`:
```
VITE_API_URL=http://localhost:3001
```

Start the frontend development server:
```bash
npm run dev
```

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
