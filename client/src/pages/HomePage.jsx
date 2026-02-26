// pages/HomePage.jsx
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Zap, Music, Package, Repeat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function HomePage() {
  const { isLoggedIn } = useAuth();

  const features = [
    {
      icon: Sparkles,
      title: 'Quality Content',
      description: 'Curated loops, drums, and collabs from top producers',
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Protected payments with escrow and dispute resolution',
    },
    {
      icon: Zap,
      title: 'Instant Delivery',
      description: 'Download your purchases immediately after payment',
    },
  ];

  const categories = [
    { icon: Music, label: 'Collaborations', href: '/browse?type=collab', color: 'from-purple-500 to-pink-500' },
    { icon: Repeat, label: 'Loop Packs', href: '/browse?type=loops', color: 'from-blue-500 to-cyan-500' },
    { icon: Package, label: 'Drum Kits', href: '/browse?type=drum_kit', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Prod
          <span className="text-gradient">market</span>
        </h1>
        <p className="text-xl text-dark-300 mb-8 max-w-2xl mx-auto">
          Buy and sell loops, drum kits, and collaborate with other producers
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/browse">
            <Button size="lg" icon={ArrowRight} iconPosition="right">
              Start Browsing
            </Button>
          </Link>
          <Link to="/become-seller">
            <Button size="lg" variant="outline">
              Become a Seller
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Browse by Category
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.label} to={cat.href}>
                <Card hover className="text-center py-10">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{cat.label}</h3>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Why ProdMarket?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} padding="lg">
                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-dark-400">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-primary-800 p-12 text-center">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-lg text-primary-100 mb-8">
            Join thousands of producers buying and selling on ProdMarket
          </p>
          <Link to={isLoggedIn ? '/browse' : '/signup'}>
            <Button size="lg" variant="secondary">
              {isLoggedIn ? 'Browse Marketplace' : 'Sign Up Free'}
            </Button>
          </Link>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </section>
    </div>
  );
}