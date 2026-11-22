# StockMate

> **Inventory and Supplier Management Platform for Food Businesses**

StockMate is a full-stack MERN application built specifically for small and independent food establishments (cafes, restaurants, bakeries, cloud kitchens, and food stalls) to eliminate spreadsheet chaos, prevent unexpected ingredient stockouts, discover wholesale food suppliers, and manage purchase orders with point-in-time price snapshots.

---

## Architecture Overview

StockMate is structured into two decoupled, scalable directories:
- `client/`: Modern React 18 single-page application built with Vite, React Router 6, Context API, Lucide icons, and a custom SaaS design system.
- `server/`: RESTful Express API with MongoDB/Mongoose, JWT authentication, role-based middleware, and immutable stock audit logging.

```
StockMate/
├── client/                     # Frontend React (Vite) Application
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, etc.)
│   │   ├── pages/              # Role-specific & Public page views
│   │   ├── layouts/            # Dashboard & Auth layouts
│   │   ├── context/            # React Context providers (AuthContext, etc.)
│   │   ├── services/           # Axios instance & API caller modules
│   │   ├── styles/             # Global CSS design system
│   │   ├── App.jsx             # React Router routing tree
│   │   └── main.jsx            # React root mount
│   ├── package.json
│   └── vite.config.js          # Vite config with API proxy
│
├── server/                     # Backend Node/Express API
│   ├── config/                 # MongoDB database connection (Mongoose)
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Error handling, Auth, Role validation
│   ├── models/                 # Mongoose Data Schemas
│   ├── routes/                 # REST API route handlers
│   ├── services/               # Reusable business logic
│   ├── .env                    # Environment variables (PORT, MONGO_URI, JWT)
│   ├── app.js                  # Express application setup
│   └── server.js               # Server entry point
│
├── project.txt                 # Complete project specification
├── learning.txt                # Developer mentor & learning guide
└── README.md
```

---

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Community Server running locally on port 27017 or a MongoDB Atlas URI

---

## Getting Started

### 1. Server Setup
```bash
cd server
npm install
# Configure your .env file (default connects to mongodb://127.0.0.1:27017/stockmate)
npm run dev    # Starts server on http://localhost:5000 with nodemon
```

### 2. Client Setup
```bash
cd client
npm install
npm run dev    # Starts Vite dev server on http://localhost:5173
```
Visit `http://localhost:5173` in your browser.
