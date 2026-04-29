# 🌸 Vivian's Flowers — A Pixel-Art RPG Flower Shop

## Project Summary
A Single-Page Application (SPA) built with the **FARM Stack**, simulating a cozy **in-game flower shop** where users can browse pixelated floral assets, view item stats, and manage a shopping cart in real-time. The project features a custom **RPG-style Pixel-Art UI** for a nostalgic, game-like user experience.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Functional Components & Hooks) |
| Styling | CSS3 — Custom Pixel-Art theme (Flexbox & Grid) |
| Backend | FastAPI (Python 3.x) with Modular Routing (APIRouter) |
| Database | MongoDB Atlas + Motor (Async MongoDB Driver) |
| Communication | RESTful API with CORS middleware |

---

## Features

- **Full CRUD Cart** — Add items, adjust quantities, remove products, and clear the entire cart.
- **Dynamic Filtering** — Real-time category filtering for *Single Stems*, *Bouquets*, and *Flower Baskets*.
- **SPA Architecture** — Seamless page transitions without full reloads.
- **Interactive Modals** — Detailed descriptions and high-resolution views via pop-up windows.
- **Responsive Grid** — Auto-adapting layout for consistent display across screen sizes.

---

## Folder Structure
PIXEL-FLOWER-SHOP
├── backend/                  # FastAPI Server
│   ├── routes/
│   │   ├── cart.py           # Cart CRUD logic
│   │   └── products.py       # Product retrieval logic
│   ├── .env                  # Environment variables (MongoDB URI)
│   ├── database.py           # MongoDB connection setup
│   ├── main.py               # Server entry point
│   ├── models.py             # Pydantic data schemas
│   └── seed.py               # Database initialization script
│
└── frontend/                 # React Application
├── public/
│   └── images/           # Pixel art assets (.png)
└── src/
├── components/
│   ├── Cart.jsx          # Shopping cart overlay
│   ├── CartItem.jsx      # Individual item row
│   ├── Header.jsx        # Navigation & shop title
│   ├── Modal.jsx         # Product detail popup
│   ├── ProductCard.jsx   # Single product display
│   └── ProductList.jsx   # Product grid container
├── App.js            # Core logic & state management
└── App.css           # Custom Pixel-Art styling

## Challenges Overcome

1. **Async Synchronization** — Used Python's Motor driver and JS `async/await` to ensure non-blocking, real-time data sync between MongoDB and the UI.
2. **Rendering Optimization** — Implemented `useCallback` to stabilize function references, resolving infinite re-render loops and boosting performance.
3. **Cloud Connectivity** — Configured MongoDB Atlas with a global IP whitelist (`0.0.0.0/0`) for seamless out-of-the-box access across environments.
4. **Iterative UI Design** — Refined the visual identity through multiple CSS iterations to perfect the retro "pixel-art wood" aesthetic.

---

## How to Run

> **Prerequisites:** Python 3.8+ and Node.js (LTS)

### Step 1 — Database Setup

No local setup required. The app is pre-configured with a **live MongoDB Atlas cluster**. The connection string is stored in `/backend/.env` and data is fetched directly from the cloud on startup.

To initialize the database with seed data, run the following in the `/backend` directory:

```bash
python seed.py
```

### Step 2 — Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

API will be live at: `http://localhost:8000`

### Step 3 — Frontend (React)

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

The app will open automatically at: `http://localhost:3000`