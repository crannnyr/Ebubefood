import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

const SITE = {
  contactPhone: '08031234567',
  contactWhatsApp: '08039876543',
  contactEmail: 'hello@cbkfoods.online',
  socialInstagram: '@cbkfoods',
  socialFacebook: 'CBKFoods',
  socialTwitter: '@cbkfoods',
};

export default function Footer() {
  const ss = SITE;
  
  return (
    <footer className="mt-auto" style={{ background: 'var(--surface-elevated)' }}>
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/images/logo.png" alt="CBK" className="w-10 h-10" />
              <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>CBK Foods</span>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Premium food delivery in Anambra. Fresh ingredients, fast delivery, made with love.
            </p>
            <div className="flex items-center gap-3">
              <a href={`https://instagram.com/${ss.socialInstagram}`} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                <Instagram size={18} />
              </a>
              <a href={`https://facebook.com/${ss.socialFacebook}`} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                <Facebook size={18} />
              </a>
              <a href={`https://twitter.com/${ss.socialTwitter}`} target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Home</Link>
              <Link to="/#menu" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Menu</Link>
              <Link to="/orders" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>My Orders</Link>
              <Link to="/ads" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Advertise With Us</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Support</h4>
            <div className="flex flex-col gap-2">
              <Link to="/profile" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>My Account</Link>
              <a href={`https://wa.me/${ss.contactWhatsApp}`} target="_blank" rel="noopener noreferrer"
                className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Help Center</a>
              <Link to="/ads" className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>For Businesses</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Contact Us</h4>
            <div className="flex flex-col gap-3">
              <a href={`tel:${ss.contactPhone}`} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Phone size={14} />
                {ss.contactPhone}
              </a>
              <a href={`https://wa.me/${ss.contactWhatsApp}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Phone size={14} />
                WhatsApp: {ss.contactWhatsApp}
              </a>
              <a href={`mailto:${ss.contactEmail}`} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Mail size={14} />
                {ss.contactEmail}
              </a>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <MapPin size={14} />
                Onitsha, Anambra State
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            &copy; 2026 CBK Foods. Made with love by Ebube &amp; Bundu.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            cbkfoods.online
          </p>
        </div>
      </div>
    </footer>
  );
}
