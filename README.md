# FretStore

FretStore is a full-stack guitar and musical instrument e-commerce web application. It provides a complete shopping flow for customers along with inventory and order management tools for administrators.

Live demo: [https://code-alpha-fret-store.vercel.app/](https://code-alpha-fret-store.vercel.app/)

## Project Context

This project was developed as part of the CodeAlpha Full Stack Development Internship. It implements the requirements for the e-commerce task, including user authentication, product catalog browsing, cart operations, checkout, and order history, alongside administrative tools for inventory and order lifecycle management.

## Features

### Customer
- User registration and authentication with JWT session persistence
- Catalog browsing by category (guitars, accessories, amplifiers) and live search
- Itemized product details with real-time stock availability indicators
- Persistent server-backed shopping cart (add, update quantities, remove items)
- Checkout flow creating orders and automatically reducing inventory
- Order history tracking with itemized purchase breakdowns
- Order cancellation for orders in pending status, restoring product stock

### Administration
- Role-based access control protecting administrative endpoints and UI
- Product catalog management (create, update, delete products)
- Inventory management with stock levels and low-stock indicators
- Order status management enforcing valid status transition workflows (pending, processing, shipped, delivered, cancelled)

## Tech Stack

- **Runtime & Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Neon in production)
- **Migrations:** node-pg-migrate
- **Validation:** Zod
- **Authentication & Security:** JSON Web Tokens (jsonwebtoken), bcrypt
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES Modules)
- **Media:** Cloudinary
- **Deployment:** Vercel

## Architecture

The backend follows a layered architectural pattern separating concerns across distinct layers:

```
Client
  │
  ▼
Express Router
  │
  ▼
Middleware (Authentication, Role Authorization, Zod Validation)
  │
  ▼
Controller (HTTP Request/Response Handling)
  │
  ▼
Service (Business Logic, Database Transactions, Stock Adjustments)
  │
  ▼
PostgreSQL (Connection Pool)
```

By decoupling route definitions, validation middleware, request handling, and database operations into dedicated modules under `src/features/`, the codebase remains maintainable and testable.

## Database Schema

Database schema changes and seed data are version-controlled and executed using `node-pg-migrate`.

```
users
├── carts
│   └── cart_items ──> products
└── orders
    └── order_items ──> products

categories ──> products
```

- `users`: User accounts with hashed passwords and role definitions (`user`, `admin`).
- `categories`: Instrument and accessory categories.
- `products`: Catalog items with pricing, brand, category reference, and stock quantity.
- `carts` & `cart_items`: User carts and cart items linked to products.
- `orders` & `order_items`: Order headers with timestamps and total amounts, linked to immutable order item snapshots.

## Authentication & Authorization

- Passwords are encrypted before database insertion using `bcrypt`.
- Upon successful login, a signed JSON Web Token (JWT) containing the user ID and role is issued.
- The `authenticate` middleware verifies incoming `Authorization: Bearer <token>` headers on protected routes.
- The `authorize("admin")` middleware restricts administrative endpoints to users with the admin role.

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register a new user account |
| POST | `/api/auth/login` | Public | Authenticate user and return JWT |
| GET | `/api/auth/me` | Authenticated | Get current authenticated user details |

### Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/categories` | Public | Retrieve all product categories |

### Products (`/api/products`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/products` | Public | Retrieve product catalog (supports category/search filters) |
| GET | `/api/products/:id` | Public | Retrieve product details by ID |
| POST | `/api/products` | Admin | Create a new product |
| PATCH | `/api/products/:id` | Admin | Update an existing product |
| DELETE | `/api/products/:id` | Admin | Delete a product |

### Cart (`/api/cart`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/cart` | Authenticated | Retrieve current user's cart and items |
| POST | `/api/cart/items` | Authenticated | Add an item to the cart |
| PATCH | `/api/cart/items/:id` | Authenticated | Update quantity of a cart item |
| DELETE | `/api/cart/items/:id` | Authenticated | Remove an item from the cart |

### Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/orders` | Authenticated | Create an order from current cart |
| GET | `/api/orders` | Authenticated | Retrieve current user's order history |
| GET | `/api/orders/:id` | Authenticated | Retrieve order details by ID for current user |
| PATCH | `/api/orders/:id/cancel` | Authenticated | Cancel a pending order |
| GET | `/api/orders/admin` | Admin | Retrieve all customer orders |
| GET | `/api/orders/admin/:id` | Admin | Retrieve detailed customer order by ID |
| PATCH | `/api/orders/admin/:id` | Admin | Update order status |

## Project Structure

```
CodeAlpha_FretStore/
├── migrations/          # Database migration files (node-pg-migrate)
├── public/              # Frontend client assets
│   ├── assets/          # Static icons and logos
│   ├── components/      # Reusable HTML partials (navbar, footer)
│   ├── css/             # Global stylesheet and design system
│   ├── js/              # Modular frontend scripts (API client, UI logic)
│   └── pages/           # Application views (index, product, cart, orders, admin, auth)
├── src/                 # Backend application source
│   ├── config/          # Database connection pool configuration
│   ├── features/        # Feature modules (routes, controllers, services, schemas)
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── categories/
│   │   ├── orders/
│   │   └── products/
│   ├── middleware/      # Global middleware (authentication, authorization)
│   ├── utils/           # Helper utilities (JWT generation)
│   ├── app.js           # Express application setup
│   └── server.js        # Server bootstrap and database connection
├── package.json
└── vercel.json          # Deployment configuration
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL database instance running locally or hosted remotely

### 1. Clone the repository
```bash
git clone https://github.com/fretdev/CodeAlpha_FretStore.git
cd CodeAlpha_FretStore
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/fretstore
JWT_SECRET=your_jwt_secret_key
```

### 4. Run database migrations
Apply the database migrations to set up the schema and seed initial categories and products:

```bash
npm run migrate:up
```

### 5. Start the application
Run the development server with automatic reloading:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5000`.

## Deployment

The production application is deployed on Vercel with a managed PostgreSQL instance on Neon.

- **Production URL:** [https://code-alpha-fret-store.vercel.app/](https://code-alpha-fret-store.vercel.app/)
- **Build / Runtime:** `@vercel/node` routing requests to `src/server.js`
