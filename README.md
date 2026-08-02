<div align="center">

# 🍽️ Gourmet Haven — Restaurant QR Ordering System

**A production-ready, full-stack QR code restaurant ordering web application.**  
Customers scan a QR code at their table, browse the menu, and place orders — no app download required.  
Staff receive live kitchen orders with real-time WebSocket updates.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 📸 Screenshots

> **Customer Menu** — Scan QR → Browse Menu → Add to Cart → Track Order Live

| Customer Menu | Item Detail | Cart & Checkout |
|---|---|---|
| Category filter pills, search, availability badges | Custom instructions, quantity selector | Table number, order summary, real-time total |

| Admin Dashboard | Live Kitchen Display | QR Code Generator |
|---|---|---|
| Revenue, orders, table occupancy stats | Audio chime alerts, status updates | Print-ready QR cards per table |

---

## ✨ Features

### 👤 Customer Experience
- 📱 **Scan QR Code** at table — auto-detects table number from URL (`/menu?table=12`)
- 🍕 **Full Menu** with categories, images, descriptions, prices, and availability indicators
- 🔍 **Search & Filter** by category or "Today's Specials"
- 🛒 **Add to Cart** with custom per-item notes (e.g. *"Less spicy, no onions"*)
- ✅ **Simple Checkout** — just your name (optional) and confirm
- 📡 **Live Order Tracker** — real-time status via WebSocket (Pending → Preparing → Ready → Served)
- 🌙 **Dark / Light Mode** toggle

### 🏪 Admin / Staff Features
- 🔐 **Secure JWT Login**
- 📊 **Dashboard** — today's revenue, active orders, table occupancy
- 🔔 **Live Kitchen Display System (KDS)** — real-time incoming orders with audio chime alert
- 🍽️ **Menu Management** — Create, edit, delete dishes; toggle availability instantly
- 📷 **Image URL support** with preset quick-select gallery
- 🗂️ **Category Management** — organize menu into sections
- 📦 **Order Status Controls** — Pending → Preparing → Ready → Served → Cancelled
- 📲 **QR Code Generator** — generate and download print-ready PNG QR cards for every table
- ⚙️ **Restaurant Settings** — name, tagline, hours, contact info, currency, table count

### ⚡ Technical Highlights
- Real-time bidirectional events via **Socket.io**
- **JWT authentication** for admin routes
- **Cart persisted** in localStorage
- **PWA ready** — manifest + service worker
- Mobile-first **responsive** design
- **Glassmorphism** UI with micro-animations
- Full **TypeScript** on both frontend and backend

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, Socket.io |
| **Database** | SQLite (default) / PostgreSQL (via env var) |
| **ORM** | Prisma |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **Realtime** | Socket.io |
| **QR Codes** | `qrcode` library |

---

## 📁 Project Structure

```
Resturent Order/
├── database/
│   ├── prisma/
│   │   └── schema.prisma        # Database models
│   └── seed.ts                  # Sample data seeder
│
├── backend/
│   ├── .env                     # Environment variables
│   └── src/
│       ├── index.ts             # Express + Socket.io server entry
│       ├── config/
│       │   ├── db.ts            # Prisma client
│       │   └── jwt.ts           # JWT helpers
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── menuController.ts
│       │   ├── orderController.ts
│       │   ├── categoryController.ts
│       │   ├── restaurantController.ts
│       │   └── qrController.ts
│       ├── middleware/
│       │   ├── auth.ts          # JWT guard middleware
│       │   └── errorHandler.ts
│       ├── routes/              # REST API route definitions
│       ├── services/
│       │   └── socketService.ts # Real-time event emitters
│       └── seed.ts              # Database seeder (backend context)
│
└── frontend/
    ├── public/
    │   ├── manifest.json        # PWA manifest
    │   └── sw.js                # Service worker
    └── src/
        ├── components/
        │   ├── customer/        # MenuItemCard, CartDrawer, ItemDetailModal, Stepper
        │   ├── admin/           # AdminSidebar, KdsOrderCard, MenuItemFormModal, QrCard
        │   └── common/          # Header
        ├── context/
        │   ├── AuthContext.tsx  # Admin JWT session
        │   ├── CartContext.tsx  # Customer cart state
        │   ├── ThemeContext.tsx # Dark/light mode
        │   └── SocketContext.tsx# WebSocket connection
        ├── pages/
        │   ├── CustomerMenuPage.tsx
        │   ├── OrderSuccessPage.tsx
        │   ├── TrackOrderPage.tsx
        │   └── admin/
        │       ├── AdminLoginPage.tsx
        │       ├── AdminDashboardPage.tsx
        │       ├── AdminOrdersPage.tsx
        │       ├── AdminMenuPage.tsx
        │       ├── AdminQrPage.tsx
        │       └── AdminSettingsPage.tsx
        ├── services/
        │   └── api.ts           # REST API client wrapper
        └── types/
            └── index.ts         # Shared TypeScript types
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ 
- **npm** v9+

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/restaurant-qr-ordering.git
cd restaurant-qr-ordering
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Set Up the Database

The app uses **SQLite by default** — no extra setup needed.

```bash
# From the backend directory
cd backend

# Push the schema to create the database
npm run db:push

# Generate the Prisma Client
npm run db:generate

# Seed with sample restaurant, menu items, admin user & tables
npm run db:seed
```

### 4. Environment Variables

The `backend/.env` file is pre-configured for local development:

```env
PORT=5000
DATABASE_URL="file:../../database/dev.db"
JWT_SECRET="restaurant_qr_super_secret_jwt_key_2026"
CLIENT_URL="http://localhost:3000"
```

> **For PostgreSQL**, change `DATABASE_URL` to your PostgreSQL connection string and update the `provider` in `database/prisma/schema.prisma`.

### 5. Run the App

Open **two terminals**:

```bash
# Terminal 1 — Backend API + Socket.io Server
cd backend
npm run dev
# → Running on http://localhost:5000
```

```bash
# Terminal 2 — Frontend (Vite Dev Server)
cd frontend
npm run dev
# → Running on http://localhost:3000
```

---

## 🌐 Pages & Routes

| Route | Description |
|---|---|
| `/` | Redirects to customer menu |
| `/menu?table=12` | **Customer menu** — QR table auto-detected |
| `/order-success?orderId=...` | Order confirmation + summary |
| `/track?orderId=...` | **Live order tracker** (real-time WebSocket) |
| `/admin/login` | Admin login |
| `/admin/dashboard` | Dashboard analytics |
| `/admin/orders` | **Live Kitchen Display System (KDS)** |
| `/admin/menu` | Menu & category management |
| `/admin/qr` | QR code generator + PNG download |
| `/admin/settings` | Restaurant profile settings |

---

## 🔑 Default Admin Credentials

```
Email:    admin@restaurant.com
Password: admin123
```

---

## 📡 REST API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | — | Admin login |
| `GET` | `/api/auth/me` | 🔐 | Get current admin |

### Menu
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/menu` | — | List all menu items (with filters) |
| `POST` | `/api/menu` | 🔐 | Create menu item |
| `PUT` | `/api/menu/:id` | 🔐 | Update menu item |
| `PATCH` | `/api/menu/:id/availability` | 🔐 | Toggle available/sold out |
| `DELETE` | `/api/menu/:id` | 🔐 | Delete menu item |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders` | — | Place a new order |
| `GET` | `/api/orders` | 🔐 | List all orders |
| `GET` | `/api/orders/stats` | 🔐 | Today's dashboard stats |
| `GET` | `/api/orders/:id` | — | Get order by ID (for tracking) |
| `PATCH` | `/api/orders/:id/status` | 🔐 | Update order status |

### Other
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/restaurant` | — | Get restaurant info |
| `PUT` | `/api/restaurant` | 🔐 | Update restaurant settings |
| `GET` | `/api/categories` | — | List categories |
| `GET` | `/api/qr/tables` | 🔐 | Get all tables with QR data URLs |
| `GET` | `/api/qr/table/:number` | — | Generate QR for a specific table |

---

## ⚡ Real-time WebSocket Events

| Event | Direction | Description |
|---|---|---|
| `new_order` | Server → All clients | Emitted when a customer places an order |
| `order_status_updated` | Server → All clients + order room | Emitted when admin updates status |
| `join_order_room` | Client → Server | Customer joins room to track their order |

---

## 🔧 Scripts Reference

### Backend (`/backend`)
```bash
npm run dev          # Start dev server with hot reload (tsx watch)
npm run build        # Compile TypeScript
npm run db:push      # Sync Prisma schema → database
npm run db:generate  # Generate Prisma Client
npm run db:seed      # Seed database with sample data
```

### Frontend (`/frontend`)
```bash
npm run dev          # Start Vite dev server (port 3000)
npm run build        # Production build (tsc + vite build)
npm run preview      # Preview production build locally
```

---

## 📦 Seeded Sample Data

After running `npm run db:seed`, the database contains:

- **1 Restaurant** — Gourmet Haven
- **1 Admin** — `admin@restaurant.com` / `admin123`
- **12 Tables** — Table #1 through #12
- **5 Categories** — Starters & Apps, Main Entrees, Artisan Pizzas, Desserts, Craft Drinks
- **13 Menu Items** — across all categories with real Unsplash food photos
- **2 Sample Orders** — Table #4 (Preparing) and Table #12 (Pending)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ using React, Node.js, Prisma & Socket.io

⭐ **Star this repo if you found it useful!**

</div>
