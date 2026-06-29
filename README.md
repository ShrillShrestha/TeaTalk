# TeaTalk

A small React + Vite web app for playing real-time question decks with a guest using Firebase Realtime Database.

## Features

- Host creates a room and shares an invite link
- Guest joins with their name
- Real-time room state synced via Firebase Realtime Database
- Deck selection, card flipping, and play flow
- Simple UI with theme and layout tweaks

## Getting Started

### Prerequisites

- Node.js 18+ or compatible version
- npm or yarn
- Firebase project with Realtime Database enabled

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root with your Firebase config values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

The app reads these values from `src/firebase.js` using `import.meta.env`.

### Run locally

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Project Structure

- `index.html` - Vite entry HTML
- `src/main.jsx` - React entry point
- `src/App.jsx` - Main application logic and screen flow
- `src/firebase.js` - Firebase initialization
- `src/components/` - UI components
- `src/data/` - deck and theme definitions

## Notes

- The app uses Firebase Realtime Database only; there is no authentication.
- Room state is stored under `rooms/<roomId>` in the database.
- URLs use hash fragments for host and guest links.
