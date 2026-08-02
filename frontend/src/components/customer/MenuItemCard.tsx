import React from 'react';
import { Plus, Sparkles, AlertCircle } from 'lucide-react';
import { MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';

interface MenuItemCardProps {
  item: MenuItem;
  onItemClick: (item: MenuItem) => void;
  currency?: string;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onItemClick, currency = '$' }) => {
  const { addToCart, cart } = useCart();

  const cartEntry = cart.find((ci) => ci.menuItem.id === item.id);
  const currentQty = cartEntry ? cartEntry.quantity : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.isAvailable) {
      addToCart(item, 1);
    }
  };

  return (
    <div
      onClick={() => onItemClick(item)}
      className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={item.imageUrl}
          alt={item.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            !item.isAvailable ? 'opacity-50 grayscale' : ''
          }`}
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {item.isTodaySpecial && item.isAvailable && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
              <Sparkles className="w-3 h-3" />
              Special
            </span>
          )}

          {!item.isAvailable && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
              <AlertCircle className="w-3 h-3" />
              Sold Out
            </span>
          )}
        </div>

        {/* Category Pill */}
        {item.category && (
          <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium">
            {item.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-500 transition-colors">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Price</span>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">
              {currency}{item.price.toFixed(2)}
            </div>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={!item.isAvailable}
            className={`relative flex items-center justify-center gap-1 px-3 py-2 rounded-2xl text-xs font-bold transition-all ${
              item.isAvailable
                ? 'bg-brand-500 hover:bg-brand-600 active:scale-95 text-white shadow-md shadow-brand-500/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
            {currentQty > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white text-brand-600 font-black text-[10px]">
                {currentQty}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
