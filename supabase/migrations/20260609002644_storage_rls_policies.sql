-- Storage RLS policies for CBK Foods

-- Public bucket read access
CREATE POLICY "Public bucket read" ON storage.objects
    FOR SELECT USING (bucket_id IN ('items-images', 'hero-banners', 'ads-media', 'avatars'));

-- Payment proofs: only the owner can read their own
CREATE POLICY "Read own payment proofs" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Authenticated users can upload to their own folders in avatars/payment-proofs
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
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role::text LIKE 'admin_%')
    );

-- Admin can update
CREATE POLICY "Admin update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role::text LIKE 'admin_%')
    );

-- Admin can delete
CREATE POLICY "Admin delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role::text LIKE 'admin_%')
    );
