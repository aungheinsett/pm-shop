# PM Online - Handbags Store with Admin Dashboard

A complete e-commerce solution for a handbags online store with a customer-facing storefront and a full-featured admin dashboard.

## ⚡ Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (installed and running locally, or a MongoDB Atlas connection string)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env` and adjust values as needed (Mongo URI, JWT secret, admin credentials). The default `.env` works with a local MongoDB at `mongodb://localhost:27017/pm-online-store`.

### 3. Seed the Database (optional but recommended)
This creates the admin user, 6 categories, 48 products, settings, and sample coupons:
```bash
npm run seed
```

### 4. Start the Server
```bash
npm start        # production
# or
npm run dev      # development (auto-restart with nodemon)
```

### 5. Access
| Location | URL |
|----------|-----|
| Store (customer frontend) | http://localhost:5000/ |
| Admin Dashboard | http://localhost:5000/admin |
| Admin Login | http://localhost:5000/admin/login |

**Default Admin Login** (after seeding):
- Email: `admin@pmonline.com`
- Password: `admin123`

---

## 📁 Project Structure

```
PMweb/
├── server.js              # Express server entry point
├── seed.js                # Database seeder (admin, categories, products, coupons)
├── .env                   # Environment configuration
├── package.json
├── config/                # (place config here)
├── models/                # Mongoose models
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Order.js
│   ├── Coupon.js
│   └── Settings.js
├── controllers/           # Route handlers
│   ├── authController.js
│   ├── productController.js
│   ├── categoryController.js
│   ├── orderController.js
│   ├── couponController.js
│   ├── settingsController.js
│   └── dashboardController.js
├── routes/                # API route definitions
├── middleware/            # auth, upload
├── admin/                 # Admin dashboard (HTML/CSS/JS)
│   ├── index.html         # Main dashboard
│   ├── login.html         # Admin login
│   ├── dashboard.css
│   └── dashboard.js
├── public/uploads/        # Uploaded product images
├── index.html             # Customer storefront
├── styles.css             # Storefront styles
└── script.js              # Storefront logic
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create staff user | Admin |
| POST | `/api/auth/login` | Admin login | Public |
| GET | `/api/auth/me` | Get current user | Admin |
| GET | `/api/auth/users` | List all staff users | Admin |
| PUT | `/api/auth/users/:id` | Update user | Admin |
| DELETE | `/api/auth/users/:id` | Delete user | Admin |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (with filters & pagination) |
| GET | `/api/products/:id` | Get one product |
| GET | `/api/products/slug/:slug` | Get product by slug |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/:id` | Update product (Admin) |
| DELETE | `/api/products/:id` | Delete product (Admin) |
| DELETE | `/api/products/bulk-delete` | Bulk delete (Admin) |

Query params for products: `?page=&limit=&category=&search=&badge=&sort=`

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create (Admin) |
| PUT | `/api/categories/:id` | Update (Admin) |
| DELETE | `/api/categories/:id` | Delete (Admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order (public checkout) |
| GET | `/api/orders` | List orders (Admin) |
| GET | `/api/orders/:id` | Get order (Admin) |
| PUT | `/api/orders/:id/status` | Update status (Admin) |
| DELETE | `/api/orders/:id` | Delete (Admin) |

### Coupons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/coupons` | List (Admin) |
| POST | `/api/coupons` | Create (Admin) |
| POST | `/api/coupons/validate` | Validate code (public) |
| PUT | `/api/coupons/:id` | Update (Admin) |
| DELETE | `/api/coupons/:id` | Delete (Admin) |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/public` | Public settings (rates, contact) |
| GET | `/api/settings` | All settings (Admin) |
| PUT | `/api/settings` | Update (Admin) |

### Dashboard Analytics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard/stats` | Summary stats | Admin |
| GET | `/api/dashboard/revenue-chart` | 12-month revenue | Admin |
| GET | `/api/dashboard/category-sales` | Category breakdown | Admin |
| GET | `/api/dashboard/recent-orders` | Recent orders | Admin |
| GET | `/api/dashboard/top-products` | Top sellers | Admin |

### Uploads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/image` | Upload single image (Admin) |
| POST | `/api/upload/images` | Upload multiple (Admin) |
| POST | `/api/upload/banner` | Upload banner (Admin) |

---

## 🛒 Admin Dashboard Features

- **Dashboard**: Revenue/order/product statistics, 12-month revenue chart, category sales chart, recent orders, top-selling products
- **Products**: Add/edit/delete products, image upload, bulk delete, search & filter by category, toggle active status, manage stock/badges/featured
- **Categories**: Full CRUD with product counts
- **Orders**: List/search/filter, view order details, update order & payment status, set tracking number
- **Coupons**: Create/manage discount codes (percentage or fixed amount, min order, usage limits, expiry)
- **Settings**: Store info, exchange rate, shipping rules, social links, SEO
- **Staff Users**: Create/manage admin staff accounts with roles

### Admin Roles
- `admin` - Full access to everything
- `manager` - Access to billing/orders/products
- `staff` - Restricted access

---

## 💱 Pricing / Currency

Every product price is stored in **MMK** (primary) and converted to **Thai Baht** (secondary) automatically using the configured exchange rate (`MMK_TO_BAHT` in `.env`, default `0.016`). You can update the rate from **Settings → Currency & Exchange Rates** in the admin panel.

---

## 🚀 Production Deployment Notes

1. **Set a strong JWT secret** in `.env`
2. **Change the default admin password** immediately after first login
3. Serve via a process manager (e.g., PM2): `pm2 start server.js`
4. Use environment variables for all sensitive config
5. Configure CORS to restrict origins in production
6. Consider using MongoDB Atlas for managed hosting
7. Serve over HTTPS via Nginx/reverse proxy
8. Back up the `public/uploads` folder and database regularly

---

## 🧪 Testing the API

You can test endpoints with curl or Postman. Example to login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pmonline.com","password":"admin123"}'
```

---

Made with ❤️ for PM Online.
