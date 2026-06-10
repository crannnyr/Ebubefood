# 🍽️ CBK FOODS - Premium Food Ordering Platform

> **Domain:** cbkfoods.online  
> **Location:** Anambra, Nigeria  
> **Owners:** Ebube & Bundu  
> **Theme:** Midnight Feast (Dark Premium)

---

## 📦 Project Structure

```
cbkfoods/
├── supabase/                          # Backend
│   ├── migrations/
│   │   ├── 001_initial_schema.sql    # Full database schema
│   │   └── 002_seed_data.sql         # Sample data
│   ├── functions/
│   │   ├── image-optimizer/          # Image/GIF compression
│   │   ├── ad-processor/             # Ad pricing calculator
│   │   ├── eod-processor/            # End of day closing
│   │   └── analytics-aggregator/     # Daily analytics
│   └── policies/
│       └── storage_rls.sql           # Storage bucket policies
│
├── frontend/                          # Frontend (Kimi Website Mode)
│   ├── css/
│   │   ├── base/                     # Variables, reset, utilities
│   │   ├── components/               # Buttons, cards, forms, etc.
│   │   ├── pages/                    # Page-specific styles
│   │   └── animations.css
│   ├── js/
│   │   ├── core/                     # App, router, state
│   │   ├── services/                 # Supabase, auth, API, storage
│   │   ├── utils/                    # Helpers, formatters, validators
│   │   ├── components/               # Reusable JS components
│   │   └── pages/                    # Page components
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   └── index.html
│
└── KIMI_WEBSITE_MODE_PROMPT.md       # ⭐ Complete build prompt
```

---

## 🚀 Quick Start

### 1. Supabase Setup
```bash
# Create new Supabase project
# Go to SQL Editor → New Query
# Run: 001_initial_schema.sql
# Run: 002_seed_data.sql
# Run: storage_rls.sql

# Deploy Edge Functions:
supabase functions deploy image-optimizer
supabase functions deploy ad-processor
supabase functions deploy eod-processor
supabase functions deploy analytics-aggregator

# Create Storage Buckets:
# - items-images (public, 5MB limit)
# - hero-banners (public, 3MB limit)
# - ads-media (public, 5MB limit)
# - payment-proofs (private, 2MB limit)
# - avatars (public, 1MB limit)
```

### 2. Frontend Setup
```bash
# Copy KIMI_WEBSITE_MODE_PROMPT.md
# Paste into Kimi Website Mode
# Kimi will generate all frontend files
# Connect to your Supabase project
```

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#FF6B35` | Buttons, CTAs, accents |
| `--secondary` | `#1A1A2E` | Background |
| `--surface` | `#16213E` | Cards |
| `--accent` | `#FFD700` | Premium highlights |
| `--success` | `#00D26A` | Order confirmations |
| `--danger` | `#FF4757` | Errors, cancellations |

---

## ✨ Key Features

### For Customers
- 🏠 Beautiful homepage with auto-rotating hero banners
- 🍽️ Category browsing with horizontal scroll on mobile
- 🛒 Smart cart with quantity management
- 📦 Order tracking with status timeline
- 💳 Bank transfer payment (admin account displayed)
- 📱 Fully responsive, mobile-first design

### For Admins (Ebube & Bundu)
- 📊 Dashboard with analytics charts
- 🍕 Full item management with owner assignment
- 🖼️ Hero banner management with routing
- 📢 Ad review & approval system
- 📈 End-of-day closing with profit splits
- 💰 Admin payment details configuration

### For Advertisers
- 📋 `/ads` page with pricing
- 📝 Submission form with auto-price calculation
- 🖼️ Media upload with format validation
- 💵 Payment proof upload
- ⏳ Review status tracking

---

## 📊 Database Schema Overview

| Table | Purpose |
|-------|----------|
| `profiles` | User profiles (extends auth.users) |
| `categories` | Food categories |
| `items` | Food items with owner (ebube/bundu/joint) |
| `hero_banners` | Homepage slider banners |
| `ads` | Advertiser submissions |
| `admin_payment_details` | Bank account for payments |
| `cart_items` | Shopping cart |
| `orders` | Customer orders |
| `order_items` | Line items with owner split |
| `day_closings` | End of day financial summary |
| `analytics_snapshots` | Daily analytics data |

---

## 🔐 Security

- ✅ Row Level Security (RLS) on all tables
- ✅ Role-based access control
- ✅ Storage bucket policies
- ✅ Input validation
- ✅ File type & size restrictions
- ✅ No secrets in client code

---

## ⚡ Performance

- 🚀 Client-side image compression before upload
- 🖼️ WebP/AVIF transformation via Supabase CDN
- 📦 Lazy loading with IntersectionObserver
- 💨 Optimistic UI updates
- 🔄 Skeleton screens for all loading states
- 📱 Mobile-first, instant-feeling interactions

---

## 💰 Ad Pricing

| Type | Duration | 1 Month | 2 Months |
|------|----------|---------|----------|
| Image | 5 seconds | ₦6,000 | ₦12,000 |
| Image | 10 seconds | ₦12,000 | ₦24,000 |
| GIF | 5 seconds | ₦10,000 | ₦20,000 |
| GIF | 10 seconds | ₦20,000 | ₦40,000 |
| Custom Creation | - | +₦5,000 | +₦5,000 |

---

## 📞 Support

For questions or issues:
- **Email:** support@cbkfoods.online
- **Phone:** [Admin Phone]
- **WhatsApp:** [Admin WhatsApp]

---

Built with ❤️ by Ebube & Bundu in Anambra, Nigeria 🇳🇬
