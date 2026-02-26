import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Mail } from 'lucide-react';
import Button from '../ui/Button';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    marketplace: [
      { label: 'Browse Services', href: '/browse' },
      { label: 'Collaborations', href: '/browse?type=collab' },
      { label: 'Loop Packs', href: '/browse?type=loop_pack' },
      { label: 'Drum Kits', href: '/browse?type=drum_kit' },
      { label: 'Subscriptions', href: '/subscriptions' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Blog', href: '/blog' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
    sellers: [
      { label: 'Become a Seller', href: '/become-seller' },
      { label: 'Seller Dashboard', href: '/dashboard' },
      { label: 'Seller Guide', href: '/seller-guide' },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Marketplace */}
          <div>
            <h3 className="text-white font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-3">
              {footerLinks.marketplace.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-dark-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-dark-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-dark-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Sellers</h3>
            <ul className="space-y-3">
              {footerLinks.sellers.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-dark-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-dark-800 pt-8 mb-8">
          <div className="max-w-md">
            <h3 className="text-white font-semibold mb-2">Stay Updated</h3>
            <p className="text-sm text-dark-400 mb-4">
              Get the latest updates on new features and exclusive deals.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">ProdMarket</p>
              <p className="text-xs text-dark-500">
                © {currentYear} ProdMarket. All rights reserved.
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-white"
                  aria-label={social.label}
                >
                  <Icon size={18} />
                </a>
              );
            })}
            <a
              href="mailto:support@prodmarket.com"
              className="p-2.5 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-white"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}