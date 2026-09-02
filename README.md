# ByteRace

ByteRace is a real-time, competitive coding platform where developers go head-to-head to solve algorithmic challenges as fast as possible. With built-in sabotage mechanics (power-ups), global authentication, and localized multiplayer rankings, it takes LeetCode-style coding to an entirely new competitive level.

## Features

- **Modes of Play**:
  - **Single Player**: Practice mode to hone your algorithmic problem-solving skills at your own pace.
  - **Multiplayer**: Create or join custom rooms with a room code to face off against another developer in real-time.
- **Real-time Multiplayer**: Powered by WebSockets to ensure lightning-fast synchronization of player states, match results, and power-up usage.
- **Power-ups & Sabotage**: Use special abilities during matches to gain an edge:
  - **Flashbang**: Temporarily blinds your opponent's screen.
  - **Critical Hit**: Deletes a random line of code from your opponent's editor.
  - **Trash Talk**: Sends a distracting message to your opponent's screen.
  - **Async Await**: Blocks your opponent from submitting their code for 30 seconds.
  - **Bad Trip**: Forces your opponent's editor into the chaotic "Ludicrous" theme.
- **AI Hints (Powered by Gemini)**: Stuck on a problem? Use the integrated Gemini AI to get intelligent, context-aware hints without giving away the full solution.
- **Head-to-Head Rankings**: A dedicated multiplayer leaderboard that exclusively tracks your head-to-head win/loss record against specific opponents you've fought.
- **Alternate Theming**: Multiple themes (Dark, Light, and Ludicrous).

## Tech Stack

### Frontend
- **Framework**: Next.js (React) with App Router
- **Language**: TypeScript
- **Styling**: Vanilla CSS + Inline Styles with dynamic Theme Context

### Backend
- **Framework**: Node.js & Express
- **Real-time Engine**: `ws` (WebSockets)
- **Database**: PostgreSQL (hosted on Neon)
- **ORM**: Prisma
- **Authentication**: JWT & bcrypt

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database URL (e.g., Neon, Supabase, or local)

### 1. Clone the repository
```bash
git clone https://github.com/ripasap/byteRace.git
cd coderace-main
```

### 2. Frontend Setup
Install dependencies and run the Next.js development server:
```bash
npm install
npm run dev
```
The frontend will run on `http://localhost:3000`.

### 3. Backend Setup
Open a new terminal window and navigate to the backend directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory with the following variables:
```env
DATABASE_URL="postgres://your-postgres-url"
JWT_SECRET="your_secret_key"
PORT=4000
```

Sync the database schema and start the REST API:
```bash
npx prisma db push
npx prisma generate
npm run dev
```
The Express API will run on `http://localhost:4000`.

### 4. WebSocket Server Setup
Open a third terminal window in the `backend` directory to run the real-time engine:
```bash
cd backend
node socketServer.js
```
The WebSocket server will run on `ws://localhost:8080`.

---

## Project Structure

- `/src/app/`: Next.js frontend application (Pages, Components, Contexts).
- `/backend/src/routes/`: Express REST API endpoints (Auth, Users).
- `/backend/prisma/`: Database schema definitions.
- `/backend/socketServer.js`: Standalone WebSocket server for handling room creation and real-time game state synchronization.
- `/backend/src/data/questions.json`: The repository of algorithmic coding problems.

## Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
