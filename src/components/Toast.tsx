import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useStore } from '@/store/useStore';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: { bg: 'rgba(0,210,106,0.15)', icon: '#00D26A', border: 'rgba(0,210,106,0.3)' },
  error: { bg: 'rgba(255,71,87,0.15)', icon: '#FF4757', border: 'rgba(255,71,87,0.3)' },
  warning: { bg: 'rgba(255,165,2,0.15)', icon: '#FFA502', border: 'rgba(255,165,2,0.3)' },
  info: { bg: 'rgba(59,130,246,0.15)', icon: '#3B82F6', border: 'rgba(59,130,246,0.3)' },
};

export default function Toast() {
  const toasts = useStore(s => s.toasts);
  const removeToast = useStore(s => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[90] flex flex-col gap-2">
      {toasts.map(toast => {
        const Icon = icons[toast.type];
        const color = colors[toast.type];
        return (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl min-w-[280px] max-w-[400px] shadow-lg animate-slide-up"
            style={{ background: color.bg, border: `1px solid ${color.border}` }}
          >
            <Icon size={18} style={{ color: color.icon }} className="flex-shrink-0" />
            <p className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
