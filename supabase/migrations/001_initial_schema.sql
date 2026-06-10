-- ============================================================
-- CBK FOODS - SUPABASE MIGRATION
-- Midnight Feast Theme | Premium Food Ordering Platform
-- Owners: Ebube & Bundu | Anambra, Nigeria
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS & TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('customer', 'admin_ebube', 'admin_bundu', 'admin_joint');
CREATE TYPE item_owner AS ENUM ('ebube', 'bundu', 'joint');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE delivery_time AS ENUM ('instant', '2_hours', '6_hours', '24_hours', '3_days', '1_week');
CREATE TYPE ad_type AS ENUM ('image', 'gif');
CREATE TYPE ad_duration AS ENUM ('5_seconds', '10_seconds');
CREATE TYPE ad_period AS ENUM ('1_month', '2_months');
CREATE TYPE ad_status AS ENUM ('pending_review', 'approved', 'rejected', 'active', 'expired');
CREATE TYPE banner_target_type AS ENUM ('category', 'external');
CREATE TYPE day_status AS ENUM ('open', 'closed');

-- ============================================================
-- TABLES
-- ============================================================

-- Users Table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    address TEXT,
    role user_role DEFAULT 'customer',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food Items
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    owner item_owner DEFAULT 'joint',
    image_url TEXT,
    delivery_time delivery_time DEFAULT 'instant',
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    prep_time_minutes INTEGER DEFAULT 15,
    calories INTEGER,
    allergens TEXT[],
    tags TEXT[],
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hero Banners (Admin-managed, routable)
CREATE TABLE hero_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'gif')),
    target_type banner_target_type NOT NULL,
    target_value TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ads System
CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_name TEXT NOT NULL,
    advertiser_email TEXT NOT NULL,
    advertiser_phone TEXT NOT NULL,
    media_url TEXT,
    media_type ad_type,
    duration ad_duration DEFAULT '5_seconds',
    period ad_period DEFAULT '1_month',
    custom_creation BOOLEAN DEFAULT FALSE,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_proof_url TEXT,
    status ad_status DEFAULT 'pending_review',
    admin_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Payment Details
CREATE TABLE admin_payment_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    bank_code TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    set_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    special_instructions TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id),
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_phone TEXT NOT NULL,
    delivery_notes TEXT,
    payment_method TEXT DEFAULT 'bank_transfer',
    bank_reference TEXT,
    placed_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    prepared_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    item_name TEXT NOT NULL,
    item_price DECIMAL(10,2) NOT NULL,
    item_cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL,
    owner item_owner NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- End of Day Closing
CREATE TABLE day_closings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    closing_date DATE NOT NULL UNIQUE,
    status day_status DEFAULT 'open',
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_cost DECIMAL(12,2) DEFAULT 0,
    total_profit DECIMAL(12,2) DEFAULT 0,
    ebube_orders INTEGER DEFAULT 0,
    ebube_revenue DECIMAL(12,2) DEFAULT 0,
    ebube_cost DECIMAL(12,2) DEFAULT 0,
    ebube_profit DECIMAL(12,2) DEFAULT 0,
    bundu_orders INTEGER DEFAULT 0,
    bundu_revenue DECIMAL(12,2) DEFAULT 0,
    bundu_cost DECIMAL(12,2) DEFAULT 0,
    bundu_profit DECIMAL(12,2) DEFAULT 0,
    joint_orders INTEGER DEFAULT 0,
    joint_revenue DECIMAL(12,2) DEFAULT 0,
    joint_cost DECIMAL(12,2) DEFAULT 0,
    joint_profit DECIMAL(12,2) DEFAULT 0,
    closed_by UUID REFERENCES profiles(id),
    closed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Snapshots
CREATE TABLE analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_date DATE NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(12,2) NOT NULL,
    owner item_owner,
    category_id UUID REFERENCES categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_owner ON items(owner);
CREATE INDEX idx_items_featured ON items(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_items_available ON items(is_available) WHERE is_available = TRUE;
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_owner ON order_items(owner);
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_hero_banners_active ON hero_banners(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_day_closings_date ON day_closings(closing_date);
CREATE INDEX idx_analytics_date ON analytics_snapshots(snapshot_date);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_payment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Profiles: Users see own, admins see all
CREATE POLICY "Users see own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR auth.jwt()->>'role' LIKE 'admin_%');

CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Categories: Public read, admin write
CREATE POLICY "Categories public read" ON categories
    FOR SELECT TO authenticated, anon USING (TRUE);

CREATE POLICY "Admin manage categories" ON categories
    FOR ALL USING (auth.jwt()->>'role' LIKE 'admin_%');

-- Items: Public read, admin write
CREATE POLICY "Items public read" ON items
    FOR SELECT TO authenticated, anon USING (is_available = TRUE OR auth.jwt()->>'role' LIKE 'admin_%');

CREATE POLICY "Admin manage items" ON items
    FOR ALL USING (auth.jwt()->>'role' LIKE 'admin_%');

-- Hero Banners: Public read, admin write
CREATE POLICY "Banners public read" ON hero_banners
    FOR SELECT TO authenticated, anon USING (is_active = TRUE);

CREATE POLICY "Admin manage banners" ON hero_banners
    FOR ALL USING (auth.jwt()->>'role' LIKE 'admin_%');

-- Ads: Public read active, admin full access
CREATE POLICY "Active ads public read" ON ads
    FOR SELECT TO authenticated, anon USING (status = 'active');

CREATE POLICY "Admin manage ads" ON ads
    FOR ALL USING (auth.jwt()->>'role' LIKE 'admin_%');

-- Admin Payment Details: Public read active, admin manage
CREATE POLICY "Active payment public read" ON admin_payment_details
    FOR SELECT TO authenticated, anon USING (is_active = TRUE);

CREATE POLICY "Admin manage payments" ON admin_payment_details
    FOR ALL USING (auth.jwt()->>'role' LIKE 'admin_%');

-- Cart: User own only
CREATE POLICY "User own cart" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- Orders: User own, admin all
CREATE POLICY "User own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id OR auth.jwt()->>'role' LIKE 'admin_%');

CREATE POLICY "Admin update orders" ON orders
    FOR UPDATE USING (auth.jwt()->>'role' LIKE 'admin_%');

CREATE POLICY "User create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items: User via order, admin all
CREATE POLICY "User order items" ON order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
        OR auth.jwt()->>'role' LIKE 'admin_%'
    );

CREATE POLICY "Admin manage order items" ON order_items
    FOR ALL USING (auth.jwt()->>'role' LIKE 'admin_%');

-- Day Closings: Admin only
CREATE POLICY "Admin day closings" ON day_closings
    FOR ALL USING (auth.jwt()->>'role' LIKE 'admin_%');

-- Analytics: Admin only
CREATE POLICY "Admin analytics" ON analytics_snapshots
    FOR ALL USING (auth.jwt()->>'role' LIKE 'admin_%');

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_banners_updated_at BEFORE UPDATE ON hero_banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_payment_details_updated_at BEFORE UPDATE ON admin_payment_details
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        new_number := 'CBK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
        SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = new_number) INTO exists_check;
        EXIT WHEN NOT exists_check;
    END LOOP;
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Auto-set order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Calculate order totals and split by owner
CREATE OR REPLACE FUNCTION calculate_order_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- This would be expanded in edge function for complex logic
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- End of Day Closing Function
CREATE OR REPLACE FUNCTION close_day(p_date DATE, p_closed_by UUID, p_notes TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
    v_closing_id UUID;
    v_total_orders INTEGER;
    v_total_revenue DECIMAL(12,2);
    v_total_cost DECIMAL(12,2);
    v_ebube_orders INTEGER;
    v_ebube_revenue DECIMAL(12,2);
    v_ebube_cost DECIMAL(12,2);
    v_bundu_orders INTEGER;
    v_bundu_revenue DECIMAL(12,2);
    v_bundu_cost DECIMAL(12,2);
    v_joint_orders INTEGER;
    v_joint_revenue DECIMAL(12,2);
    v_joint_cost DECIMAL(12,2);
BEGIN
    -- Calculate totals for the day
    SELECT 
        COUNT(DISTINCT o.id),
        COALESCE(SUM(oi.item_price * oi.quantity), 0),
        COALESCE(SUM(oi.item_cost_price * oi.quantity), 0)
    INTO v_total_orders, v_total_revenue, v_total_cost
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE DATE(o.created_at) = p_date
    AND o.status IN ('confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered');

    -- Ebube totals
    SELECT 
        COUNT(DISTINCT o.id),
        COALESCE(SUM(oi.item_price * oi.quantity), 0),
        COALESCE(SUM(oi.item_cost_price * oi.quantity), 0)
    INTO v_ebube_orders, v_ebube_revenue, v_ebube_cost
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE DATE(o.created_at) = p_date
    AND oi.owner = 'ebube'
    AND o.status IN ('confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered');

    -- Bundu totals
    SELECT 
        COUNT(DISTINCT o.id),
        COALESCE(SUM(oi.item_price * oi.quantity), 0),
        COALESCE(SUM(oi.item_cost_price * oi.quantity), 0)
    INTO v_bundu_orders, v_bundu_revenue, v_bundu_cost
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE DATE(o.created_at) = p_date
    AND oi.owner = 'bundu'
    AND o.status IN ('confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered');

    -- Joint totals
    SELECT 
        COUNT(DISTINCT o.id),
        COALESCE(SUM(oi.item_price * oi.quantity), 0),
        COALESCE(SUM(oi.item_cost_price * oi.quantity), 0)
    INTO v_joint_orders, v_joint_revenue, v_joint_cost
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE DATE(o.created_at) = p_date
    AND oi.owner = 'joint'
    AND o.status IN ('confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered');

    -- Insert or update day closing
    INSERT INTO day_closings (
        closing_date, status, total_orders, total_revenue, total_cost, total_profit,
        ebube_orders, ebube_revenue, ebube_cost, ebube_profit,
        bundu_orders, bundu_revenue, bundu_cost, bundu_profit,
        joint_orders, joint_revenue, joint_cost, joint_profit,
        closed_by, closed_at, notes
    ) VALUES (
        p_date, 'closed', v_total_orders, v_total_revenue, v_total_cost, v_total_revenue - v_total_cost,
        v_ebube_orders, v_ebube_revenue, v_ebube_cost, v_ebube_revenue - v_ebube_cost,
        v_bundu_orders, v_bundu_revenue, v_bundu_cost, v_bundu_revenue - v_bundu_cost,
        v_joint_orders, v_joint_revenue, v_joint_cost, v_joint_revenue - v_joint_cost,
        p_closed_by, NOW(), p_notes
    )
    ON CONFLICT (closing_date) DO UPDATE SET
        status = 'closed',
        total_orders = EXCLUDED.total_orders,
        total_revenue = EXCLUDED.total_revenue,
        total_cost = EXCLUDED.total_cost,
        total_profit = EXCLUDED.total_profit,
        ebube_orders = EXCLUDED.ebube_orders,
        ebube_revenue = EXCLUDED.ebube_revenue,
        ebube_cost = EXCLUDED.ebube_cost,
        ebube_profit = EXCLUDED.ebube_profit,
        bundu_orders = EXCLUDED.bundu_orders,
        bundu_revenue = EXCLUDED.bundu_revenue,
        bundu_cost = EXCLUDED.bundu_cost,
        bundu_profit = EXCLUDED.bundu_profit,
        joint_orders = EXCLUDED.joint_orders,
        joint_revenue = EXCLUDED.joint_revenue,
        joint_cost = EXCLUDED.joint_cost,
        joint_profit = EXCLUDED.joint_profit,
        closed_by = EXCLUDED.closed_by,
        closed_at = EXCLUDED.closed_at,
        notes = EXCLUDED.notes
    RETURNING id INTO v_closing_id;

    RETURN v_closing_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO categories (name, slug, description, display_order) VALUES
('Rice Dishes', 'rice-dishes', 'Delicious rice meals', 1),
('Swallows', 'swallows', 'Traditional Nigerian swallows', 2),
('Soups & Stews', 'soups-stews', 'Rich and flavorful', 3),
('Proteins', 'proteins', 'Meat, fish & more', 4),
('Snacks', 'snacks', 'Quick bites', 5),
('Drinks', 'drinks', 'Refreshments', 6),
('Cakes & Pastries', 'cakes-pastries', 'Special occasion treats', 7);
