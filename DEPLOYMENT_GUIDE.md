# 🚀 CBK FOODS - Deployment Guide

## Step 1: Supabase Project Setup

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose region closest to Nigeria (e.g., `eu-west-1` or `af-south-1`)
4. Save your **Project URL** and **Anon Key**

### 1.2 Run Migrations
1. Go to **SQL Editor** → **New Query**
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Run the query
4. Copy contents of `supabase/migrations/002_seed_data.sql`
5. Run the query

### 1.3 Setup Storage Buckets
1. Go to **Storage** → **New Bucket**
2. Create these buckets:
   - `items-images` (Public, 5MB limit)
   - `hero-banners` (Public, 3MB limit)
   - `ads-media` (Public, 5MB limit)
   - `payment-proofs` (Private, 2MB limit)
   - `avatars` (Public, 1MB limit)
3. For each bucket, go to **Policies** → **New Policy**
4. Apply policies from `supabase/policies/storage_rls.sql`

### 1.4 Deploy Edge Functions
```bash
# Install Supabase CLI if not already
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy image-optimizer
supabase functions deploy ad-processor
supabase functions deploy eod-processor
supabase functions deploy analytics-aggregator
```

### 1.5 Setup Auth
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Enable **Phone** provider (for OTP)
4. Configure SMTP for email confirmations

### 1.6 Create Admin Users
```sql
-- After users register, run this to make them admin
UPDATE profiles 
SET role = 'admin_joint' 
WHERE id = 'USER_UUID_HERE';

-- For Ebube
UPDATE profiles 
SET role = 'admin_ebube' 
WHERE id = 'EBUBE_UUID_HERE';

-- For Bundu
UPDATE profiles 
SET role = 'admin_bundu' 
WHERE id = 'BUNDU_UUID_HERE';
```

---

## Step 2: Frontend Deployment

### Option A: Netlify (Recommended)
1. Build the frontend files
2. Drag & drop the `frontend` folder to Netlify
3. Or connect GitHub repo for auto-deploy
4. Set environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### Option B: Vercel
1. Connect GitHub repo
2. Set framework preset to "Other"
3. Set build command (if using build tool)
4. Set environment variables

### Option C: Static Hosting (cPanel, etc.)
1. Upload all frontend files to public_html
2. Ensure `index.html` is at root
3. Configure `.htaccess` for SPA routing:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## Step 3: Domain Setup

### 3.1 Connect Domain
1. Go to your domain registrar (where you bought cbkfoods.online)
2. Add DNS records pointing to your hosting:
   - **A Record**: `@` → `YOUR_SERVER_IP`
   - **CNAME**: `www` → `cbkfoods.online`

### 3.2 SSL Certificate
1. Enable SSL/HTTPS on your hosting
2. Let's Encrypt (free) or purchase SSL
3. Force HTTPS redirect

---

## Step 4: Post-Launch Checklist

### Essential Setup
- [ ] Add real admin payment details in admin settings
- [ ] Upload real food images (compressed)
- [ ] Set up real categories and items
- [ ] Configure hero banners with real images
- [ ] Test order flow end-to-end
- [ ] Test payment proof upload
- [ ] Test admin dashboard
- [ ] Test EOD closing
- [ ] Test ad submission flow

### Content
- [ ] Add real contact info
- [ ] Add social media links
- [ ] Add delivery zones/areas
- [ ] Add terms of service
- [ ] Add privacy policy

### Testing
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test on tablet
- [ ] Test on desktop
- [ ] Test slow network (3G)
- [ ] Test offline behavior
- [ ] Test auth flow (register, login, logout)
- [ ] Test cart persistence
- [ ] Test order placement
- [ ] Test admin CRUD operations

### Optimization
- [ ] Run Lighthouse audit (aim for 90+)
- [ ] Compress all images
- [ ] Enable CDN caching
- [ ] Minify CSS/JS
- [ ] Enable gzip compression on server

---

## 🔄 Maintenance

### Daily
- [ ] Check new orders
- [ ] Process payments
- [ ] Update order statuses
- [ ] Close day (EOD)

### Weekly
- [ ] Review ad submissions
- [ ] Check analytics
- [ ] Update featured items
- [ ] Review low-stock items

### Monthly
- [ ] Review pricing
- [ ] Update hero banners
- [ ] Check expired ads
- [ ] Backup database

---

## 🆘 Troubleshooting

### Issue: Images not loading
- Check Storage bucket is public
- Check RLS policies
- Check file paths
- Check CORS settings

### Issue: Auth not working
- Check Supabase URL and key
- Check auth providers are enabled
- Check email confirmation settings
- Check RLS policies on profiles table

### Issue: Orders not saving
- Check RLS policies on orders table
- Check user is authenticated
- Check form validation
- Check console for errors

### Issue: Admin access denied
- Check user role in profiles table
- Check JWT claims
- Check admin route guards
- Re-login after role change

---

## 📞 Support Contacts

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Supabase Discord:** [discord.supabase.com](https://discord.supabase.com)
- **Kimi Help:** Ask in Kimi chat

---

**Good luck with CBK Foods! 🍽️🔥**
