-- CBK Foods - Seed Data
-- Run after migration

-- Insert sample items with owner assignments
INSERT INTO items (name, slug, description, price, cost_price, category_id, owner, delivery_time, is_featured, prep_time_minutes, tags) VALUES
('Jollof Rice & Chicken', 'jollof-rice-chicken', 'Smoky party jollof with tender grilled chicken', 2500.00, 1200.00, (SELECT id FROM categories WHERE slug = 'rice-dishes'), 'joint', 'instant', true, 20, ARRAY['spicy', 'popular']),
('Fried Rice & Turkey', 'fried-rice-turkey', 'Fragrant fried rice with seasoned turkey', 2800.00, 1400.00, (SELECT id FROM categories WHERE slug = 'rice-dishes'), 'ebube', 'instant', true, 20, ARRAY['mild']),
('Coconut Rice & Fish', 'coconut-rice-fish', 'Creamy coconut rice with fried fish', 2200.00, 1000.00, (SELECT id FROM categories WHERE slug = 'rice-dishes'), 'bundu', 'instant', false, 25, ARRAY['mild', 'seafood']),
('Ofada Rice & Stew', 'ofada-rice-stew', 'Local Ofada rice with special ayamase stew', 3000.00, 1500.00, (SELECT id FROM categories WHERE slug = 'rice-dishes'), 'joint', 'instant', true, 30, ARRAY['spicy', 'local']),
('Pounded Yam & Egusi', 'pounded-yam-egusi', 'Smooth pounded yam with rich egusi soup', 2500.00, 1000.00, (SELECT id FROM categories WHERE slug = 'swallows'), 'ebube', 'instant', true, 20, ARRAY['soup']),
('Amala & Ewedu', 'amala-ewedu', 'Soft amala with ewedu and gbegiri', 2000.00, 800.00, (SELECT id FROM categories WHERE slug = 'swallows'), 'bundu', 'instant', true, 15, ARRAY['soup', 'local']),
('Semovita & Ogbono', 'semovita-ogbono', 'Semovita with draw soup', 2300.00, 900.00, (SELECT id FROM categories WHERE slug = 'swallows'), 'joint', 'instant', false, 20, ARRAY['soup']),
('Afang Soup & Fufu', 'afang-soup-fufu', 'Nutritious afang soup with fufu', 2800.00, 1200.00, (SELECT id FROM categories WHERE slug = 'soups-stews'), 'ebube', 'instant', false, 25, ARRAY['soup', 'vegetable']),
('Oha Soup & Garri', 'oha-soup-garri', 'Traditional Oha soup', 2600.00, 1100.00, (SELECT id FROM categories WHERE slug = 'soups-stews'), 'bundu', 'instant', false, 25, ARRAY['soup', 'local']),
('Grilled Chicken', 'grilled-chicken', 'Spicy grilled chicken quarters', 3500.00, 1800.00, (SELECT id FROM categories WHERE slug = 'proteins'), 'joint', 'instant', true, 25, ARRAY['grilled', 'spicy']),
('Fried Fish', 'fried-fish', 'Crispy fried tilapia', 2000.00, 900.00, (SELECT id FROM categories WHERE slug = 'proteins'), 'bundu', 'instant', false, 15, ARRAY['seafood']),
('Peppered Beef', 'peppered-beef', 'Spicy peppered beef chunks', 1500.00, 700.00, (SELECT id FROM categories WHERE slug = 'proteins'), 'ebube', 'instant', false, 15, ARRAY['spicy']),
('Meat Pie', 'meat-pie', 'Flaky pastry with seasoned meat filling', 500.00, 200.00, (SELECT id FROM categories WHERE slug = 'snacks'), 'joint', 'instant', true, 10, ARRAY['pastry']),
('Chin Chin', 'chin-chin', 'Crunchy sweet chin chin', 300.00, 100.00, (SELECT id FROM categories WHERE slug = 'snacks'), 'bundu', 'instant', false, 5, ARRAY['sweet']),
('Puff Puff', 'puff-puff', 'Soft fluffy puff puff', 400.00, 150.00, (SELECT id FROM categories WHERE slug = 'snacks'), 'ebube', 'instant', false, 10, ARRAY['sweet']),
('Fresh Chapman', 'fresh-chapman', 'Refreshing Chapman cocktail', 800.00, 300.00, (SELECT id FROM categories WHERE slug = 'drinks'), 'joint', 'instant', true, 2, ARRAY['refreshing']),
('Zobo Drink', 'zobo-drink', 'Homemade zobo with ginger', 500.00, 150.00, (SELECT id FROM categories WHERE slug = 'drinks'), 'bundu', 'instant', false, 2, ARRAY['healthy']),
('Palm Wine', 'palm-wine', 'Fresh palm wine', 600.00, 250.00, (SELECT id FROM categories WHERE slug = 'drinks'), 'ebube', 'instant', false, 2, ARRAY['local']),
('Birthday Cake (Small)', 'birthday-cake-small', 'Beautiful birthday cake - serves 8', 15000.00, 7000.00, (SELECT id FROM categories WHERE slug = 'cakes-pastries'), 'joint', '1_week', true, 0, ARRAY['cake', 'custom']),
('Wedding Cake Tier', 'wedding-cake-tier', 'Elegant 3-tier wedding cake', 75000.00, 35000.00, (SELECT id FROM categories WHERE slug = 'cakes-pastries'), 'joint', '1_week', false, 0, ARRAY['cake', 'custom']),
('Meat Pie (Dozen)', 'meat-pie-dozen', '12 pieces of meat pie', 5000.00, 2200.00, (SELECT id FROM categories WHERE slug = 'snacks'), 'joint', '24_hours', false, 30, ARRAY['bulk']);

-- Insert sample hero banners
INSERT INTO hero_banners (title, subtitle, media_url, media_type, target_type, target_value, display_order, is_active) VALUES
('Craving Something Delicious?', 'Order now and get it in minutes', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200', 'image', 'category', 'rice-dishes', 1, true),
('Fresh From Our Kitchen', 'Made with love, delivered with care', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200', 'image', 'category', 'swallows', 2, true),
('Special Occasion?', 'Order our custom cakes with 1 week delivery', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200', 'image', 'category', 'cakes-pastries', 3, true);

-- Insert admin payment details (sample)
INSERT INTO admin_payment_details (account_name, account_number, bank_name, bank_code, is_active, set_by) VALUES
('CBK Foods Limited', '0123456789', 'Access Bank', '044', true, NULL);
