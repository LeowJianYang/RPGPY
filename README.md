# FWDD-Assignment

A hybrid Physical + Digital semi-roguelike board game platform, built with React, Vite, SWC, and Express. This project features a modern UI, real-time multiplayer, and RESTful API backend.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or above recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/LeowJianYang/FWDDWEB.git
   cd FWDDWEB
   ```

2. **Install dependencies for both client and server:**
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

3. **Start the development servers:**
   - **Client:**
     ```bash
     cd ../client
     npm run dev
     ```
   - **Server:**
     ```bash
     cd ../server
     npm run dev
     ```

---

## 📁 Project Structure

```
FWDD-Assignment/
│
├── client/                # Frontend root
│   ├── package.json
│   ├── RPGPy/             # Main UI logic and pages
│   │   ├── components/    # Global state & stores (e.g., UserStore)
│   │   ├── src/
│   │   │   ├── components/  # UI widgets (modals, loading, etc.)
│   │   │   └── ...         # Main UI logic
│   │   └── ...
│   └── ...
│
├── server/                # Backend root
│   ├── package.json
│   ├── src/
│   │   ├── app.js         # Express app entry
│   │   ├── routes/        # RESTful API endpoints
│   │   └── ...
│   └── ...
└── ...
```

---

## Tech Stack

- **Frontend:** React + Vite + SWC
- **Backend:** Express (Node.js)
- **API:** RESTful
- **State Management:** Zustand (client global state)
- **Real-time:** Socket.IO (for multiplayer features)

---

## Key Folders

- `client/` - User-facing application root
  - `client/RPGPy/` - Main UI logic and pages
  - `client/RPGPy/components/` - Global state (e.g., UserStore)
  - `client/RPGPy/src/components/` - UI widgets (modals, loading, etc.)
- `server/` - Backend API and logic (RESTful, Express)

---

## Usage

- Start both client and server as described above.
- Access the app via the client dev server URL (usually http://localhost:5173/).
- The backend runs on http://localhost:3000/ by default.

---

## License

MIT License. See [LICENSE](./LICENSE) for details.
