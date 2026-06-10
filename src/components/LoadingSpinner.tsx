interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 20, md: 32, lg: 48 };

export default function LoadingSpinner({ size = 'md', className = '' }: Props) {
  const s = sizes[size];
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className="rounded-full border-2 border-t-transparent animate-spin"
        style={{
          width: s,
          height: s,
          borderColor: 'rgba(255,107,53,0.2)',
          borderTopColor: 'var(--primary)',
        }}
      />
    </div>
  );
}
