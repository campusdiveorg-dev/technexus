import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, X, Filter, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FilterDrawer from '../components/FilterDrawer';
import { CATEGORIES, formatKES } from '../data/products';
import { apiUrl } from '../lib/api';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State
  const initialCategory = searchParams.get('cat') || 'all';
  const initialSearch = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceLimit, setPriceLimit] = useState(15000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Live products from the API
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    setLoadingProducts(true);
    fetch(apiUrl('/products?limit=100'))
      .then(r => r.json())
      .then(data => {
        const list = data.products || data.data?.products || [];
        // Normalise DB shape → component shape
        setProducts(list.map(p => ({
          ...p,
          title: p.name,
          image: p.image || p.image_url,
          price: parseFloat(p.price) || 0,
          sellerId: p.seller_id,
          brand: p.store_name || p.seller_name || 'Byte Tech Partner',
          inStock: (p.stock ?? 1) > 0,
          specs: typeof p.specs === 'string' ? p.specs.split('|').map(s => s.trim()) : (p.specs || []),
          seller: p.store_name || p.seller_name || 'Byte Tech',
          rating: p.rating ?? 4.8,
          reviews: p.reviews ?? 0,
          reviewsCount: p.reviews ?? 0,
        })));
        setProductsError('');
      })
      .catch(() => setProductsError('Unable to load products. Please refresh.'))
      .finally(() => setLoadingProducts(false));
  }, []);

  // Sync URL params if updated externally
  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('q');
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  // Handle Category select
  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('cat');
    } else {
      searchParams.set('cat', catId);
    }
    setSearchParams(searchParams);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceLimit(15000);
    setMinRating(0);
    setSortBy('featured');
    setInStockOnly(false);
    setSearchParams({});
  };

  // Filtered & Sorted products computation
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
      if (product.price > priceLimit) return false;
      if (minRating > 0 && (product.rating ?? 0) < minRating) return false;
      if (inStockOnly && !product.inStock) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const title = (product.title || product.name || '').toLowerCase();
        const brand = (product.brand || '').toLowerCase();
        const desc  = (product.description || '').toLowerCase();
        const specs = Array.isArray(product.specs)
          ? product.specs.join(' ').toLowerCase()
          : String(product.specs || '').toLowerCase();
        if (!title.includes(query) && !brand.includes(query) && !desc.includes(query) && !specs.includes(query)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc')  return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating')     return (b.rating ?? 0) - (a.rating ?? 0);
      return 0;
    });
  }, [products, selectedCategory, priceLimit, minRating, inStockOnly, searchQuery, sortBy]);

  return (
    <div className="catalog-page" style={{ padding: '36px 0 60px' }}>
      <div className="container">
        {/* Top Header & Search Bar */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--midnight-navy)', marginBottom: '8px' }}>
            Hardware & Tech Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '24px' }}>
            Browse certified enterprise computers, sound gear, accessories, and flagship smartphones with instant KRA eTIMS invoice.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {/* Live Search Input */}
            <div style={{
              position: 'relative',
              flex: '1 1 300px',
              maxWidth: '600px'
            }}>
              <Search 
                size={18} 
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} 
              />
              <input 
                type="text"
                placeholder="Search MacBook, ThinkPad, Sony, RTX, 4K..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 46px',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--surface-border)',
                  background: 'var(--surface-white)',
                  fontSize: '0.95rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Mobile Filter Trigger Button */}
            <button
              type="button"
              className="btn-mobile-filter"
              onClick={() => setIsFilterDrawerOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--surface-white)',
                border: '1.5px solid var(--surface-border)',
                fontWeight: '600',
                color: 'var(--midnight-navy)',
                cursor: 'pointer'
              }}
            >
              <Filter size={18} color="var(--primary-blue)" />
              <span>Filters</span>
              {(selectedCategory !== 'all' || minRating > 0 || priceLimit < 350000 || inStockOnly) && (
                <span style={{
                  background: 'var(--primary-blue)',
                  color: '#fff',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%'
                }} />
              )}
            </button>
          </div>
        </div>

        {/* Horizontal Category Chips Bar */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '16px',
          marginBottom: '24px',
          WebkitOverflowScrolling: 'touch'
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySelect(cat.id)}
              style={{
                whiteSpace: 'nowrap',
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: selectedCategory === cat.id ? '1px solid var(--primary-blue)' : '1px solid var(--surface-border)',
                background: selectedCategory === cat.id ? 'var(--primary-blue)' : 'var(--surface-white)',
                color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-main)',
                boxShadow: selectedCategory === cat.id ? '0 4px 12px rgba(0, 88, 188, 0.25)' : 'none'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Catalog Layout: Desktop Sidebar + Product Grid */}
        <div className="catalog-layout" style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '32px',
          alignItems: 'start'
        }}>
          {/* Desktop Filter Sidebar */}
          <aside className="catalog-sidebar-desktop" style={{
            background: 'var(--surface-white)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--surface-border)',
            position: 'sticky',
            top: '90px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={18} color="var(--primary-blue)" />
                <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--midnight-navy)' }}>Filters</span>
              </div>
              <button 
                type="button" 
                onClick={handleResetFilters}
                style={{ fontSize: '0.8rem', color: 'var(--primary-blue)', fontWeight: '600' }}
              >
                Reset All
              </button>
            </div>

            {/* Sort Order */}
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--surface-border)',
                  background: 'var(--surface-frost)',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                <option value="featured">Featured Picks</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="filter-label" style={{ margin: 0 }}>Max Price</label>
                <span style={{ fontWeight: '700', color: 'var(--primary-blue)', fontSize: '0.9rem' }}>
                  KES {priceLimit.toLocaleString()}
                </span>
              </div>
              <input 
                type="range"
                min="1000"
                max="350000"
                step="5000"
                value={priceLimit}
                onChange={(e) => setPriceLimit(Number(e.target.value))}
                className="price-slider-input"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                <span>1K</span>
                <span>350K</span>
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="filter-group">
              <label className="filter-label">Customer Rating</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[0, 3, 4, 4.5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setMinRating(stars)}
                    className={`rating-pill ${minRating === stars ? 'active' : ''}`}
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    {stars === 0 ? 'All' : `${stars}★+`}
                  </button>
                ))}
              </div>
            </div>

            {/* In-Stock Toggle */}
            <div className="filter-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
                <input 
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-blue)' }}
                />
                In Stock Only
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div>
            {/* Counter bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <span style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                Showing <strong style={{ color: 'var(--midnight-navy)' }}>{filteredProducts.length}</strong> items
              </span>
            </div>

            {/* Loading / Error states */}
            {loadingProducts ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                <Loader2 size={36} style={{ margin: '0 auto 16px', display: 'block', animation: 'spin 1s linear infinite', color: 'var(--primary-blue)' }} />
                <p style={{ fontWeight: '600' }}>Loading catalog from database…</p>
              </div>
            ) : productsError ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--error-red)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
                <p style={{ fontWeight: '600' }}>{productsError}</p>
              </div>
            ) : filteredProducts.length === 0 ? (

              <div style={{
                textAlign: 'center',
                padding: '64px 20px',
                background: 'var(--surface-white)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--surface-border)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--midnight-navy)', marginBottom: '8px' }}>
                  No hardware matching your criteria
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
                  Try relaxing your price slider, resetting rating filters, or changing your search terms.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-blue)',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '24px'
              }}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Slide-Up Filter Sheet */}
      <FilterDrawer 
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        priceRange={priceLimit}
        onPriceChange={setPriceLimit}
        minRating={minRating}
        onRatingChange={setMinRating}
        sortBy={sortBy}
        onSortChange={setSortBy}
        inStockOnly={inStockOnly}
        onInStockChange={setInStockOnly}
        onReset={handleResetFilters}
      />
    </div>
  );
}
