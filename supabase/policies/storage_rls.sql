-- CBK Foods - Storage RLS Policies
-- Apply these in Supabase Dashboard SQL Editor

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public buckets: anyone can read
CREATE POLICY "Public bucket read" ON storage.objects
    FOR SELECT USING (bucket_id IN ('items-images', 'hero-banners', 'ads-media', 'avatars'));

-- Authenticated users can upload to their own folders
CREATE POLICY "User upload own" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id IN ('avatars', 'payment-proofs')
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Admin can upload anywhere
CREATE POLICY "Admin upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        auth.jwt()->>'role' LIKE 'admin_%'
    );

-- Admin can delete
CREATE POLICY "Admin delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (auth.jwt()->>'role' LIKE 'admin_%');

-- File size limits (set in bucket settings):
-- items-images: 5MB
-- hero-banners: 3MB
-- ads-media: 5MB
-- payment-proofs: 2MB
-- avatars: 1MB

-- Allowed MIME types:
-- images: image/jpeg, image/png, image/webp, image/gif, image/avif
-- payment-proofs: image/jpeg, image/png, image/pdf
