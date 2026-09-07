import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatKES } from '../data/products';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { BorderBeam } from './magicui/BorderBeam';

export function ProductCard({ product, featured = false }) {
    const { addToCart } = useCart();
    const [justAdded, setJustAdded] = useState(false);

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1400);
    };

    return (
        <article className={`product-card group relative bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col`}>
            {/* Optional BorderBeam for flagship items */}
            {featured && (
                <BorderBeam size={180} duration={10} borderWidth={1.5} colorFrom="#00d1ff" colorTo="#3b82f6" />
            )}

            {/* Thumbnail */}
            <div className="product-thumb relative aspect-[4/3] w-full bg-slate-950 overflow-hidden">
                {product.tag && (
                    <span className="product-badge absolute top-3 left-3 z-10 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-950/80 text-cyan-400 border border-cyan-500/30 backdrop-blur-md">
                        {product.tag}
                    </span>
                )}
                <Link to={`/product/${product.id}`} className="block w-full h-full">
                    <img 
                        src={product.image} 
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80';
                        }}
                    />
                </Link>
            </div>

            {/* Content */}
            <div className="product-body p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                <div>
                    {/* Rating */}
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mb-1.5">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{product.rating || '5.0'}</span>
                        <span className="text-slate-500 font-medium">({product.reviewsCount || 1})</span>
                        <span className="text-slate-600 ml-auto text-[11px] font-medium">{product.category}</span>
                    </div>

                    {/* Title */}
                    <h3 className="product-name font-bold text-base text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
                        <Link to={`/product/${product.id}`}>
                            {product.name}
                        </Link>
                    </h3>

                    {/* Specs snippet */}
                    <p className="product-specs text-xs text-slate-400 mt-1 line-clamp-1 font-mono">
                        {product.specs || product.description}
                    </p>
                </div>

                {/* Footer Price & CTA */}
                <div className="product-footer pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Retail Price</span>
                        <span className="product-price font-extrabold text-lg text-white tracking-tight">
                            {formatKES(product.price)}
                        </span>
                    </div>

                    <button
                        onClick={handleAdd}
                        className={`add-cart-btn p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-90 ${
                            justAdded 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                        }`}
                        aria-label={`Add ${product.name} to Cart`}
                    >
                        {justAdded ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span className="hidden sm:inline">Added!</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-4 h-4" />
                                <span className="hidden sm:inline">Add</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;
