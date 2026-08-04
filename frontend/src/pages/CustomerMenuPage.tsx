import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UtensilsCrossed, Sparkles, QrCode, ShoppingBag, ArrowRight } from 'lucide-react';
import { MenuItem, Category, Restaurant } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { MenuCategoryBar } from '../components/customer/MenuCategoryBar';
import { MenuItemCard } from '../components/customer/MenuItemCard';
import { ItemDetailModal } from '../components/customer/ItemDetailModal';

export const CustomerMenuPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { tableNumber, setTableNumber, totalItems, totalAmount, setIsCartOpen } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showTodayOnly, setShowTodayOnly] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Table Detection from URL ?table=12
  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      const parsed = parseInt(tableParam);
      if (!isNaN(parsed) && parsed > 0) {
        setTableNumber(parsed);
      }
    }
  }, [searchParams, setTableNumber]);

  // 2. Fetch Restaurant Info, Categories & Menu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [resRest, resCats, resMenu] = await Promise.all([
          api.getRestaurant(),
          api.getCategories(),
          api.getMenuItems({ availableOnly: false }),
        ]);

        if (resRest.success) setRestaurant(resRest.restaurant);
        if (resCats.success) setCategories(resCats.categories);
        if (resMenu.success) setMenuItems(resMenu.items);
      } catch (err) {
        console.error('Error loading menu:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 3. Filtered Menu Calculation
  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
      return false;
    }
    if (showTodayOnly && !item.isTodaySpecial) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = item.name.toLowerCase().includes(q);
      const descMatch = item.description.toLowerCase().includes(q);
      if (!nameMatch && !descMatch) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen pb-24">
      
      {/* Restaurant Hero Banner */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950 text-white py-8 px-4 sm:py-12 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Digital QR Table Ordering</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight">
              {restaurant?.name || 'Gourmet Haven'}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              {restaurant?.tagline || 'Scan, order, and relax. Freshly cooked meals served directly to your table.'}
            </p>
          </div>

          {/* Active Table Pill */}
          <div className="self-start md:self-auto p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-brand-500/30">
              {tableNumber || '#'}
            </div>
            <div>
              <div className="text-xs text-slate-300 font-medium">Ordering For</div>
              <div className="text-sm font-bold text-white">
                {tableNumber ? `Table Number ${tableNumber}` : 'Scanning Table...'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation & Search */}
      <MenuCategoryBar
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showTodayOnly={showTodayOnly}
        onToggleTodayOnly={() => setShowTodayOnly(!showTodayOnly)}
      />

      {/* Menu Items Grid */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-20 sm:pt-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <UtensilsCrossed className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              No menu items found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Try adjusting your search query or selecting a different food category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onItemClick={(item) => setSelectedItem(item)}
                currency={restaurant?.currency || 'Nu'}
              />
            ))}
          </div>
        )}
      </main>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        currency={restaurant?.currency || 'Nu'}
      />

      {/* Floating View Cart Sticky Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-4 px-6 rounded-3xl bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white shadow-2xl shadow-brand-500/40 flex items-center justify-between font-bold text-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-brand-600 flex items-center justify-center font-extrabold text-xs">
                {totalItems}
              </div>
              <span>View Food Tray</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base">${totalAmount.toFixed(2)}</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
