# Unikai B2B Platform — Backend REST API Documentation

**Base URL (Local Development):**
- Web / iOS Simulator: `http://localhost:5000/api`
- Android Emulator: `http://10.0.2.2:5000/api`
- Physical Device: `http://YOUR_COMPUTER_LOCAL_IP:5000/api`

**Database:**
- Local MongoDB Community Server: `mongodb://127.0.0.1:27017/unikai_db`

**Authentication Header:**
- Protected routes require: `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Health & Database Status

### `GET /api/health`
- **Authentication:** None (Public)
- **Description:** Reports server status and live Local MongoDB connection state.
- **Response (`200 OK` - Connected):**
  ```json
  {
    "success": true,
    "server": "running",
    "database": "connected",
    "environment": "development",
    "timestamp": "2026-10-08T15:00:00.000Z"
  }
  ```
- **Response (`503 Service Unavailable` - Disconnected):**
  ```json
  {
    "success": false,
    "server": "running",
    "database": "disconnected"
  }
  ```

---

## 2. Authentication (`/api/auth`)

### `POST /api/auth/register`
- **Authentication:** Public
- **Request Body:**
  ```json
  {
    "name": "Tariq Al-Balushi",
    "companyName": "Al-Maha Hypermarket LLC",
    "email": "customer@unikai.local",
    "phone": "+968 9512 3456",
    "password": "Customer@12345",
    "address": {
      "label": "Main Warehouse",
      "street": "Building 42, Ruwi",
      "city": "Muscat",
      "country": "Oman"
    }
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Account registered successfully.",
    "token": "<JWT_TOKEN>",
    "user": { "_id": "...", "name": "Tariq Al-Balushi", "role": "CUSTOMER", "lastLoginAt": "..." }
  }
  ```
- **Errors:** `400` if email already exists or fields missing.

### `POST /api/auth/login`
- **Authentication:** Public
- **Description:** Authenticates Admin (`ADMIN`) or Customer (`CUSTOMER`) and updates `lastLoginAt`.
- **Request Body:**
  ```json
  {
    "email": "admin@unikai.local",
    "password": "Admin@12345"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Logged in successfully.",
    "token": "<JWT_TOKEN>",
    "user": {
      "_id": "...",
      "name": "Unikai System Administrator",
      "email": "admin@unikai.local",
      "role": "ADMIN",
      "lastLoginAt": "2026-10-08T15:00:00.000Z"
    }
  }
  ```
- **Errors:** `401` Invalid credentials, `403` Account deactivated.

### `POST /api/auth/logout`
- **Authentication:** Optional Bearer Token
- **Response (`200 OK`):** `{ "success": true, "message": "Logged out successfully." }`

### `GET /api/auth/me`
- **Authentication:** Required (`CUSTOMER` or `ADMIN`)
- **Response (`200 OK`):** Returns current user object with populated `addresses`.

### `POST /api/auth/forgot-password`
- **Authentication:** Public
- **Request Body:** `{ "email": "customer@unikai.local" }`
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Password reset token generated for local environment.",
    "resetToken": "482910",
    "expiresInMinutes": 30
  }
  ```

### `POST /api/auth/reset-password`
- **Authentication:** Public
- **Request Body:**
  ```json
  {
    "email": "customer@unikai.local",
    "resetToken": "482910",
    "newPassword": "NewPassword@123"
  }
  ```
- **Response (`200 OK`):** `{ "success": true, "message": "Password has been reset successfully. You can now log in." }`

### `PUT /api/auth/change-password`
- **Authentication:** Required (`CUSTOMER` or `ADMIN`)
- **Request Body:** `{ "currentPassword": "Customer@12345", "newPassword": "NewPassword@123" }`

---

## 3. Products (`/api/products`)

### `GET /api/products`
- **Authentication:** Public
- **Query Parameters:**
  - `search` or `q`: Search by name, SKU, description, or size
  - `category`: Category ID or slug (`yoghurt-laban`, `juices-beverages`, `dairy-milk`, etc.)
  - `brand`: Brand ID or slug (`unikai`, `unikai-fresh`, `unikai-pure`, etc.)
  - `size`: Exact size filter (`12 × 10ml`, `180 ml`, `1 L`, `100 g`, `400 g`, `1 Kg`, `4 Kg`, `10 Kg`)
  - `minPrice`, `maxPrice`: Selling price range in OMR
  - `isFeatured`: `true` | `false`
  - `isPopular`: `true` | `false`
  - `includeInactive`: `true` (used by Admin Panel)
  - `sort`: `newest` | `price_asc` | `price_desc` | `name_asc` | `popular` | `featured`
  - `page`, `limit`: Pagination parameters
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "products": [
      {
        "_id": "...",
        "name": "Meethi Lassi",
        "slug": "meethi-lassi",
        "sku": "UNK-LAS-001",
        "sizes": ["12 × 10ml", "180 ml", "1 L"],
        "price": 0.104,
        "invoicePrice": 1.25,
        "images": ["/uploads/meethi-lassi.svg"],
        "nutrition": {
          "energy": "78 kcal / 100ml",
          "protein": "2.6 g",
          "carbohydrates": "11.8 g",
          "fat": "2.2 g",
          "vitaminC": "1.5 mg",
          "calcium": "110 mg"
        },
        "stock": 480,
        "isFeatured": true,
        "isActive": true
      }
    ],
    "pagination": { "total": 18, "page": 1, "limit": 12, "pages": 2 }
  }
  ```

### `GET /api/products/sizes`
- **Authentication:** Public
- **Response (`200 OK`):** `{ "success": true, "sizes": ["12 × 10ml", "180 ml", "1 L", "100 g", ...] }`

### `GET /api/products/:slugOrId`
- **Authentication:** Public
- **Response (`200 OK`):** `{ "success": true, "product": { ... }, "relatedProducts": [ ... ] }`
- **Errors:** `404` Product not found.

### `POST /api/products`
- **Authentication:** Required (`ADMIN`)
- **Request Body:**
  ```json
  {
    "name": "Meethi Lassi",
    "slug": "meethi-lassi",
    "sku": "UNK-LAS-001",
    "category": "<CATEGORY_ID>",
    "brand": "<BRAND_ID>",
    "sizes": ["12 × 10ml", "180 ml"],
    "price": 0.104,
    "invoicePrice": 1.250,
    "description": "...",
    "images": ["/uploads/meethi-lassi.svg"],
    "nutrition": { "energy": "78 kcal", "protein": "2.6 g", "carbohydrates": "11.8 g", "fat": "2.2 g", "vitaminC": "1.5 mg", "calcium": "110 mg" },
    "stock": 480,
    "isFeatured": true,
    "isActive": true
  }
  ```

### `PUT /api/products/:id`
- **Authentication:** Required (`ADMIN`)
- **Description:** Updates product fields in Local MongoDB; changes immediately reflect on React Website and Flutter App.

### `PATCH /api/products/:id/toggle-status`
- **Authentication:** Required (`ADMIN`)
- **Description:** Toggles `isActive` (`true` / `false`).

### `DELETE /api/products/:id`
- **Authentication:** Required (`ADMIN`)

---

## 4. Categories (`/api/categories`)

- `GET /api/categories` — List categories (`?includeInactive=true` for Admin)
- `GET /api/categories/:slugOrId` — Get category details
- `POST /api/categories` — Create category (`ADMIN`)
- `PUT /api/categories/:id` — Update category (`ADMIN`)
- `PATCH /api/categories/:id/toggle-status` — Activate/Deactivate category (`ADMIN`)
- `DELETE /api/categories/:id` — Delete category (`ADMIN`)

---

## 5. Brands (`/api/brands`)

- `GET /api/brands` — List brands (`?includeInactive=true` for Admin)
- `GET /api/brands/:slugOrId` — Get brand details
- `POST /api/brands` — Create brand (`ADMIN`)
- `PUT /api/brands/:id` — Update brand (`ADMIN`)
- `PATCH /api/brands/:id/toggle-status` — Activate/Deactivate brand (`ADMIN`)
- `DELETE /api/brands/:id` — Delete brand (`ADMIN`)

---

## 6. Cart (`/api/cart`)

- `GET /api/cart` — Fetch authenticated customer's persisted cart with live prices from MongoDB
- `POST /api/cart` — Add or update item (`{ productId, size, quantity, mode: 'add' | 'set' }`)
- `PUT /api/cart/sync` — Merge guest `localStorage` cart into database cart on login
- `DELETE /api/cart/item?productId=...&size=...` — Remove specific item
- `DELETE /api/cart` — Clear entire cart

---

## 7. Orders & WhatsApp Ordering (`/api/orders`)

### `POST /api/orders`
- **Authentication:** Optional Bearer Token (supports logged-in customers and guest checkout)
- **Request Body:**
  ```json
  {
    "customerName": "John",
    "customerPhone": "+968 9512 3456",
    "address": {
      "street": "Way 3109, Ruwi",
      "city": "Muscat",
      "country": "Oman"
    },
    "orderChannel": "WEB",
    "items": [
      { "productId": "<ID>", "size": "12 × 10ml", "quantity": 10 },
      { "productId": "<ID>", "size": "1 L", "quantity": 5 }
    ]
  }
  ```
- **Response (`201 Created`):** Returns saved `order` + auto-generated `whatsapp` message and `whatsappUrl`.

### `POST /api/orders/whatsapp-preview`
- **Authentication:** Optional Bearer Token
- **Description:** Generates the formatted WhatsApp order message addressed to Salesman Sachin using the WhatsApp number stored in MongoDB.

### `GET /api/orders/my-orders`
- **Authentication:** Required (`CUSTOMER`)

### `GET /api/orders/:id`
- **Authentication:** Required (`CUSTOMER` or `ADMIN`)

### `GET /api/orders`
- **Authentication:** Required (`ADMIN`)
- **Query Params:** `status`, `search`, `page`, `limit`

### `PATCH /api/orders/:id/status`
- **Authentication:** Required (`ADMIN`)
- **Request Body:** `{ "status": "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled" }`

---

## 8. User Profile & Saved Addresses (`/api/users`)

- `GET /api/users/profile` — Get customer profile + saved addresses
- `PUT /api/users/profile` — Update name, companyName, email, phone
- `GET /api/users/addresses` — List saved addresses
- `POST /api/users/addresses` — Add new address
- `PUT /api/users/addresses/:id` — Edit address
- `DELETE /api/users/addresses/:id` — Delete address
- `PATCH /api/users/addresses/:id/default` — Set default delivery address

---

## 9. Salesman & Settings (`/api/salesman`, `/api/settings`)

- `GET /api/salesman` — Public endpoint returning active Salesman (`Sachin`, `phone`, `whatsappNumber`, `email`, `region`, `workingHours`)
- `PUT /api/salesman` — Admin endpoint to update Salesman details in MongoDB
- `GET /api/settings` — Public endpoint returning currency (`OMR`), support info, and salesman info
- `PUT /api/settings` — Admin endpoint to update platform and salesman settings

---

## 10. Admin Panel Endpoints (`/api/admin`)

- `GET /api/admin/dashboard` — Admin KPIs, recent orders, recently logged-in users (`lastLoginAt`), and system health (`Backend: Connected`, `Database: Connected`, `Environment: Development`)
- `GET /api/admin/customers` — List all customers with registration date, `lastLoginAt`, status, order count, and address (never exposes password hashes)
- `GET /api/admin/customers/:id` — View customer details, saved addresses, and order history
- `PATCH /api/admin/customers/:id/toggle-status` — Activate/Deactivate customer account
- `POST /api/admin/upload` — Multipart form upload (`image` field) to `/uploads/` (or Cloudinary if configured)
