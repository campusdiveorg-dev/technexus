import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, Truck, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import ShimmerButton from '../components/magicui/ShimmerButton';
import ShinyText from '../components/magicui/ShinyText';
import Marquee from '../components/magicui/Marquee';
import NumberTicker from '../components/magicui/NumberTicker';
import DotPattern from '../components/magicui/DotPattern';
import { BentoGrid, BentoCard } from '../components/magicui/BentoGrid';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';

const BRANDS = [
  'Apple Silicon', 'Dell Technologies', 'Lenovo ThinkPad', 'HP Enterprise',
  'ASUS ROG', 'Sony Audio', 'Anker Power', 'Logitech Master', 'Samsung Galaxy', 'Bose Professional'
];

export default function HomePage() {
  const navigate = useNavigate();
  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <div className="home-page">
      {/* Hero Section with DotPattern and Shimmer UI */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden', padding: '72px 0 64px' }}>
        <DotPattern opacity={0.4} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
            {/* Shiny Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                background: 'rgba(0, 88, 188, 0.08)',
                border: '1px solid rgba(0, 88, 188, 0.2)',
                borderRadius: '999px',
                fontSize: '0.88rem',
                fontWeight: '600',
              }}>
                <Sparkles size={16} color="var(--primary-blue)" />
                <ShinyText text="Kenya's #1 Enterprise Tech Ecosystem" />
              </span>
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: '800',
              lineHeight: 1.15,
              color: 'var(--midnight-navy)',
              letterSpacing: '-0.03em',
              marginBottom: '20px'
            }}>
              Direct From Authorized Dealers. <br />
              <span className="gradient-text" style={{
                background: 'linear-gradient(135deg, #0058BC 0%, #00D1FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                100% Tax Invoiced via KRA eTIMS.
              </span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              lineHeight: 1.65,
              marginBottom: '36px',
              maxWidth: '680px',
              margin: '0 auto 36px'
            }}>
              Discover workstation laptops, studio audio, flagship smartphones, and professional accessories. 
              Protected by official warranty and instant M-Pesa STK push checkout.
            </p>

            {/* Hero CTAs */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <ShimmerButton 
                variant="primary" 
                size="lg" 
                onClick={() => navigate('/catalog')}
              >
                <span>Browse Hardware Catalog</span>
                <ArrowRight size={18} />
              </ShimmerButton>

              <ShimmerButton 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/catalog?tag=FLAGSHIP')}
              >
                <span>View Flagship Gear</span>
              </ShimmerButton>
            </div>

            {/* Quick Micro-Pills */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '40px',
              flexWrap: 'wrap',
              fontSize: '0.88rem',
              color: 'var(--text-muted)'
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--accent-success)" /> Genuine East Africa Warranty
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--accent-success)" /> Instant M-Pesa STK Push
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="var(--accent-success)" /> Automated KRA eTIMS Receipts
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Magic UI Brand Marquee */}
      <section style={{ padding: '24px 0', background: 'var(--surface-white)', borderY: '1px solid var(--surface-border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-light)' }}>
            Authorized Hardware Partners & Global Brands
          </span>
        </div>
        <Marquee speed={35} pauseOnHover>
          {BRANDS.map((brand, idx) => (
            <div key={idx} style={{
              padding: '10px 24px',
              background: 'var(--surface-frost)',
              borderRadius: '999px',
              border: '1px solid var(--surface-border)',
              fontWeight: '700',
              fontSize: '0.95rem',
              color: 'var(--midnight-navy)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-blue)' }} />
              {brand}
            </div>
          ))}
        </Marquee>
      </section>

      {/* Bento Grid Features & Categories */}
      <section className="container" style={{ padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--midnight-navy)', marginBottom: '10px' }}>
            Built for Kenya’s Developers, Creators & Businesses
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            Curated workstations, high-fidelity acoustics, and enterprise infrastructure backed by certified suppliers.
          </p>
        </div>

        <BentoGrid>
          <BentoCard 
            title="High-End Workstations & Laptops"
            description="Apple M3/M4 Silicon, Dell XPS, Lenovo ThinkPads ready for intensive compilation, machine learning, and 4K creative rendering."
            colSpan={8}
            badge="Top Category"
            ctaText="Explore Laptops"
            onCtaClick={() => navigate('/catalog?cat=laptops')}
            style={{
              backgroundImage: 'radial-gradient(circle at top right, rgba(0, 209, 255, 0.08), transparent 60%)'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
              <span className="spec-tag">Apple M3 Pro</span>
              <span className="spec-tag">36GB Unified RAM</span>
              <span className="spec-tag">OLED 120Hz</span>
              <span className="spec-tag">RTX 4080</span>
            </div>
          </BentoCard>

          <BentoCard 
            title="KRA eTIMS Compliant"
            description="Every order generates an authentic QR-verified fiscal invoice with 16% VAT breakdown for corporate tax claims."
            colSpan={4}
            theme="dark"
            badge="Fiscal System"
            ctaText="Verify Receipt"
            onCtaClick={() => navigate('/receipt')}
          >
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--electric-blue)', fontFamily: 'monospace' }}>
                CU SERIAL: KRA-BYT-2026-09
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                Direct iTax QR code validation
              </div>
            </div>
          </BentoCard>

          <BentoCard 
            title="Studio & ANC Audio"
            description="Sony WH-1000XM5, AirPods Max, and studio reference acoustics with industry-leading noise cancellation."
            colSpan={4}
            badge="Audiophile"
            ctaText="Shop Audio"
            onCtaClick={() => navigate('/catalog?cat=audio')}
          />

          <BentoCard 
            title="Smartphones & High-Res Tablets"
            description="Dual SIM, 5G enterprise devices including iPhone 16 Pro Max, Galaxy S24 Ultra, and iPad Pro with Apple Pencil hover."
            colSpan={4}
            badge="Flagship Gear"
            ctaText="Shop Phones"
            onCtaClick={() => navigate('/catalog?cat=phones')}
          />

          <BentoCard 
            title="Docks, Keyboards & Ergonomics"
            description="Thunderbolt 4 hubs, Logitech MX Master 3S, mechanical keyboards, and 4K creator monitors for high productivity."
            colSpan={4}
            badge="Workspace"
            ctaText="Shop Accessories"
            onCtaClick={() => navigate('/catalog?cat=accessories')}
          />
        </BentoGrid>
      </section>

      {/* Featured Hardware Section with Product Cards & BorderBeam */}
      <section style={{ padding: '64px 0', background: 'var(--surface-white)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Spotlight Picks
              </span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--midnight-navy)', marginTop: '4px' }}>
                Featured Hardware Today
              </h2>
            </div>
            <Link to="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: 'var(--primary-blue)' }}>
              <span>View All 18+ Products</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="product-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {featuredProducts.map((product, idx) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                featured={idx === 0} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Live Metrics Counter with NumberTicker */}
      <section style={{ padding: '64px 0', background: 'linear-gradient(135deg, #0A192F, #060D17)', color: '#fff' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--electric-blue)' }}>
                <NumberTicker target={12500} />+
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginTop: '6px' }}>
                Hardware Deliveries Across Kenya
              </p>
            </div>

            <div>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: '#fff' }}>
                <NumberTicker target={99} />.8%
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginTop: '6px' }}>
                IntaSend M-Pesa Success Rate
              </p>
            </div>

            <div>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent-success)' }}>
                <NumberTicker target={100} />%
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginTop: '6px' }}>
                KRA eTIMS Fiscal Compliance
              </p>
            </div>

            <div>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent-amber)' }}>
                <NumberTicker target={42} />+
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginTop: '6px' }}>
                Vetted Authorized Merchants
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Merchant CTA Banner */}
      <section className="container" style={{ padding: '64px 24px' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-blue), #003777)',
          borderRadius: 'var(--radius-xl)',
          padding: '48px 36px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          boxShadow: '0 20px 40px rgba(0, 88, 188, 0.25)'
        }}>
          <div style={{ maxWidth: '600px' }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Mombasa Express Tech
            </span>
            <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '12px', marginBottom: '8px' }}>
              Looking for High-End Developer & Enterprise Hardware?
            </h3>
            <p style={{ opacity: 0.9, fontSize: '1rem', lineHeight: 1.5 }}>
              Same-day delivery in Mombasa CBD, 24h nationwide dispatch across Kenya, official East Africa warranties, 
              and automated KRA eTIMS fiscal invoices generated at checkout.
            </p>
          </div>
          <div>
            <ShimmerButton 
              variant="electric" 
              size="lg"
              onClick={() => navigate('/catalog')}
            >
              <span>Explore All Hardware</span>
              <ArrowRight size={18} />
            </ShimmerButton>
          </div>
        </div>
      </section>
    </div>
  );
}
