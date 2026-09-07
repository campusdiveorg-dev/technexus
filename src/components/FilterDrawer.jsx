import React from 'react';
import { X, SlidersHorizontal, Check, RefreshCw } from 'lucide-react';

export default function FilterDrawer({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  priceRange,
  maxPriceLimit = 350000,
  onPriceChange,
  minRating,
  onRatingChange,
  sortBy,
  onSortChange,
  inStockOnly,
  onInStockChange,
  onReset
}) {
  if (!isOpen) return null;

  return (
    <div className="filter-drawer-overlay" onClick={onClose}>
      <div 
        className="filter-drawer-sheet" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-drawer-title"
      >
        {/* Drag handle for mobile */}
        <div className="filter-drawer-handle" />

        {/* Header */}
        <div className="filter-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={20} color="var(--primary-blue)" />
            <h3 id="filter-drawer-title" style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--midnight-navy)' }}>
              Filter & Sort
            </h3>
          </div>
          <button 
            type="button" 
            className="filter-drawer-close" 
            onClick={onClose}
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="filter-drawer-body">
          {/* Sort By */}
          <div className="filter-group">
            <label className="filter-label">Sort Order</label>
            <div className="filter-sort-options">
              {[
                { id: 'featured', label: 'Featured' },
                { id: 'price-asc', label: 'Price: Low to High' },
                { id: 'price-desc', label: 'Price: High to Low' },
                { id: 'rating', label: 'Highest Rated' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`sort-pill ${sortBy === opt.id ? 'active' : ''}`}
                  onClick={() => onSortChange(opt.id)}
                >
                  {sortBy === opt.id && <Check size={14} style={{ marginRight: '4px' }} />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <div className="filter-category-grid">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => onSelectCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="filter-label" style={{ margin: 0 }}>Max Price</label>
              <span style={{ fontWeight: '700', color: 'var(--primary-blue)', fontSize: '0.95rem' }}>
                KES {Number(priceRange).toLocaleString()}
              </span>
            </div>
            <input 
              type="range"
              min="1000"
              max={maxPriceLimit}
              step="5000"
              value={priceRange}
              onChange={(e) => onPriceChange(Number(e.target.value))}
              className="price-slider-input"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>KES 1,000</span>
              <span>KES {Number(maxPriceLimit).toLocaleString()}</span>
            </div>
          </div>

          {/* Customer Ratings */}
          <div className="filter-group">
            <label className="filter-label">Minimum Rating</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 3, 4, 4.5].map((stars) => (
                <button
                  key={stars}
                  type="button"
                  className={`rating-pill ${minRating === stars ? 'active' : ''}`}
                  onClick={() => onRatingChange(stars)}
                >
                  {stars === 0 ? 'Any' : `${stars}★ & up`}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Toggle */}
          <div className="filter-group">
            <label className="checkbox-toggle-label" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onInStockChange(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary-blue)' }}
              />
              <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-main)' }}>
                In-Stock Items Only
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="filter-drawer-footer">
          <button 
            type="button" 
            className="btn-drawer-reset" 
            onClick={onReset}
          >
            <RefreshCw size={16} style={{ marginRight: '6px' }} />
            Reset
          </button>
          <button 
            type="button" 
            className="btn-drawer-apply" 
            onClick={onClose}
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}
