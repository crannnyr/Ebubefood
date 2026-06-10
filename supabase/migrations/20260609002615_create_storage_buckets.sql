-- Create storage buckets for CBK Foods
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('items-images', 'items-images', true, 5242880, '{"image/jpeg","image/png","image/webp","image/gif","image/avif"}'),
  ('hero-banners', 'hero-banners', true, 3145728, '{"image/jpeg","image/png","image/webp","image/gif","image/avif"}'),
  ('ads-media', 'ads-media', true, 5242880, '{"image/jpeg","image/png","image/webp","image/gif","image/avif"}'),
  ('payment-proofs', 'payment-proofs', false, 2097152, '{"image/jpeg","image/png","application/pdf"}'),
  ('avatars', 'avatars', true, 1048576, '{"image/jpeg","image/png","image/webp","image/gif","image/avif"}')
ON CONFLICT (id) DO NOTHING;
