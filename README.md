# RPGPY Hybrid Educational Games (WORKING)

A hybrid Physical + Digital semi-roguelike board game platform, built with React, Vite, SWC, and Express. This project features a modern UI, real-time multiplayer, and RESTful API backend.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or above recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/LeowJianYang/RPGPY.git
   cd RPGPy
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

4. **Add Your Own `.env.local` OR `.env` file:**
   -`client\RPGPy\`
   ```bash
      VITE_API_URL
   ```
   -`server\`
   ```bash
      AES_KEY **for AES encryption**
      IV **for AES IV Encryption**
      DB_INFF_HN **for Database Host Name**
      DB_INFF_UN **for Database Username**
      DB_INFF_PR ** for Database Port**
      DB_INFF_PW ** for Database Password**
      DB_INFF_DBN **for Database Name**
      SERVICE_URI **for Databse URI**
      WEB_URL ** for Web URL (OPTIONAL) **
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
- **API:** RESTful/RPC
- **State Management:** Zustand (client global state)
- **Real-time:** Socket.IO (for multiplayer features)
- **Databse:** MySQL DB 

---

## Key Folders

- `client/` - User-facing application root
  - `client/RPGPy/` - Main UI logic and pages
  - `client/RPGPy/components/` - Global state (e.g., UserStore)
  - `client/RPGPy/src/components/` - UI widgets (modals, loading, etc.)
- `server/` - Backend API and logic (RESTful/RPC, Express)

---

## Usage

- Start both client and server as described above.
- Access the app via the client dev server URL (usually http://localhost:5173/).
- The backend runs on http://localhost:3000/ by default.
- Please Change the ```secure:false``` and ```sameSite:lax``` for development
- For Deploy Change it to ```secure:true ``` and ```sameSite:none```.

---

## License/Copyright

MIT License. See [LICENSE](./LICENSE) for details.
Intro.js. See [NOTICE](./NOTICE.md) for details.
Credits of the Sound. [CREDITS](./CREDITS.md)
