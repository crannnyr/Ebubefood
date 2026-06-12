const LOGO = 'https://dpioixansygkjdbphfdj.supabase.co/storage/v1/object/public/product-images/0.6690683366920113.webp';

export default function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="relative flex items-center justify-center" style={{ width: 120, height: 72 }}>
        <img
          src={LOGO}
          alt="CBK Foods"
          className="w-14 h-14 rounded-full logo-rolling"
          style={{ boxShadow: 'var(--shadow-glow)' }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>CBK Foods</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Serving up deliciousness...</p>
      </div>
    </div>
  );
}