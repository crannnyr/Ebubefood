import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Heart, Star, Gift,
  Headphones, ChevronRight,
  Phone, MessageCircle, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

/* ── Support contact modal ─────────────────────────────────────── */
interface SupportContact {
  phone: string;
  label: string;
  is_whatsapp: boolean;
  is_call: boolean;
}

function SupportModal({ onClose }: { onClose: () => void }) {
  const [contacts, setContacts] = useState<SupportContact[]>([]);

  useEffect(() => {
    supabase
      .from('support_contacts')
      .select('phone, label, is_whatsapp, is_call')
      .eq('is_active', true)
      .then(({ data }) => { if (data) setContacts(data); });
  }, []);

  /* Normalise Nigerian number → international WhatsApp format */
  const toWaNumber = (phone: string) =>
    phone.startsWith('0') ? `234${phone.slice(1)}` : phone.replace(/^\+/, '');

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{
          background: '#111118',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3
              className="text-base font-bold"
              style={{ color: 'var(--text-primary, #ffffff)' }}
            >
              Help & Support
            </h3>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted, #6b7280)' }}>
              We're here to help
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-muted, #6b7280)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Contact options */}
        {contacts.map((c, i) => (
          <div key={i} className="space-y-3">
            {c.is_whatsapp && (
              <a
                href={`https://wa.me/${toWaNumber(c.phone)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 w-full p-4 rounded-xl transition-colors hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(34,197,94,0.15)' }}
                >
                  <MessageCircle size={20} style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                    WhatsApp Us
                  </p>
                  <p className="text-[11px]" style={{ color: '#22c55e' }}>
                    {c.phone}
                  </p>
                </div>
                <ChevronRight size={16} className="ml-auto" style={{ color: '#6b7280' }} />
              </a>
            )}

            {c.is_call && (
              <a
                href={`tel:${c.phone}`}
                className="flex items-center gap-3 w-full p-4 rounded-xl transition-colors hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: 'rgba(96,165,250,0.1)',
                  border: '1px solid rgba(96,165,250,0.2)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(96,165,250,0.15)' }}
                >
                  <Phone size={20} style={{ color: '#60a5fa' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                    Call Us
                  </p>
                  <p className="text-[11px]" style={{ color: '#60a5fa' }}>
                    {c.phone}
                  </p>
                </div>
                <ChevronRight size={16} className="ml-auto" style={{ color: '#6b7280' }} />
              </a>
            )}
          </div>
        ))}

        {contacts.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted, #6b7280)' }}>
            Loading contact details…
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Single menu row ───────────────────────────────────────────── */
interface MenuRowProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  badge?: string;
  to?: string;
  onClick?: () => void;
}

function MenuRow({ icon, iconBg, title, subtitle, badge, to, onClick }: MenuRowProps) {
  const inner = (
    <div className="flex items-center gap-3 py-3.5 group cursor-pointer">
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary, #ffffff)' }}
          >
            {title}
          </span>
          {badge && (
            <span
              className="px-2 py-0.5 rounded-md text-[9px] font-bold"
              style={{
                background: 'rgba(249,115,22,0.18)',
                color: 'var(--primary, #f97316)',
                border: '1px solid rgba(249,115,22,0.25)',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <p
          className="text-[11px] mt-0.5 truncate"
          style={{ color: 'var(--text-muted, #6b7280)' }}
        >
          {subtitle}
        </p>
      </div>

      {/* Chevron */}
      <ChevronRight
        size={16}
        className="flex-shrink-0 transition-transform group-hover:translate-x-0.5"
        style={{ color: 'var(--text-muted, #6b7280)' }}
      />
    </div>
  );

  if (to) return <Link to={to} className="block">{inner}</Link>;
  return <button onClick={onClick} className="w-full text-left">{inner}</button>;
}

/* ── Divider ───────────────────────────────────────────────────── */
const Divider = () => (
  <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }} />
);

/* ── Main export ───────────────────────────────────────────────── */
export default function MenuList() {
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <>
      <div className="px-4 py-2">
        <div
          className="max-w-[1400px] mx-auto rounded-2xl px-4"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <MenuRow
            icon={<MapPin size={18} style={{ color: '#f97316' }} />}
            iconBg="rgba(249,115,22,0.1)"
            title="Saved Addresses"
            subtitle="Manage your delivery addresses"
            to="/addresses"
          />
          <Divider />

          <MenuRow
            icon={<Heart size={18} style={{ color: '#ef4444' }} />}
            iconBg="rgba(239,68,68,0.1)"
            title="Favourite Meals"
            subtitle="Your most ordered meals"
            to="/favourites"
          />
          <Divider />

          <MenuRow
            icon={<Star size={18} style={{ color: '#fbbf24' }} />}
            iconBg="rgba(251,191,36,0.1)"
            title="Reviews & Ratings"
            subtitle="See your reviews and ratings"
            to="/reviews"
          />
          <Divider />

          <MenuRow
            icon={<Gift size={18} style={{ color: '#ec4899' }} />}
            iconBg="rgba(236,72,153,0.1)"
            title="Refer & Earn"
            subtitle="Invite friends and earn rewards"
            badge="Earn ₦2,000"
            to="/referral"
          />
          <Divider />

          <MenuRow
            icon={<Headphones size={18} style={{ color: '#60a5fa' }} />}
            iconBg="rgba(96,165,250,0.1)"
            title="Help & Support"
            subtitle="Call or WhatsApp our support team"
            onClick={() => setSupportOpen(true)}
          />
        </div>
      </div>

      {supportOpen && <SupportModal onClose={() => setSupportOpen(false)} />}
    </>
  );
}
