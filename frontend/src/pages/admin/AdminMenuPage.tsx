import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit3, Trash2, ToggleLeft, ToggleRight, Sparkles, UtensilsCrossed } from 'lucide-react';
import { MenuItem, Category } from '../../types';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { MenuItemFormModal } from '../../components/admin/MenuItemFormModal';
import toast from 'react-hot-toast';

export const AdminMenuPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resMenu, resCats] = await Promise.all([
        api.getMenuItems({ availableOnly: false }),
        api.getCategories(),
      ]);

      if (resMenu.success) setItems(resMenu.items);
      if (resCats.success) setCategories(resCats.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleAvailability = async (id: string) => {
    try {
      const res = await api.toggleItemAvailability(id);
      if (res.success) {
        toast.success(`Availability toggled for "${res.item.name}"`);
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, isAvailable: res.item.isAvailable } : it))
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update availability');
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await api.deleteMenuItem(id);
      if (res.success) {
        toast.success(`Deleted "${name}"`);
        setItems((prev) => prev.filter((it) => it.id !== id));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete menu item');
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <AdminLayout>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-serif">
            Menu & Category Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Add new dishes, update pricing, and toggle instant availability.
          </p>
        </div>

        <button
          onClick={() => {
            setItemToEdit(null);
            setIsModalOpen(true);
          }}
          className="py-3 px-5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Menu Item</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by dish name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-48 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
              <tr>
                <th className="py-4 px-4">Item</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Available</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.isTodaySpecial && (
                          <span title="Today's Special">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                        {item.description}
                      </p>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">
                    {item.category?.name || 'Uncategorized'}
                  </td>

                  <td className="py-3 px-4 font-extrabold text-slate-900 dark:text-white">
                    ${item.price.toFixed(2)}
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleAvailability(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        item.isAvailable
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-600 border border-red-500/30'
                      }`}
                    >
                      {item.isAvailable ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-500" />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-red-500" />
                          <span>Sold Out</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setItemToEdit(item);
                          setIsModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Edit Item"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <UtensilsCrossed className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No menu items found</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-3 p-3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1 truncate">
                        <span className="truncate">{item.name}</span>
                        {item.isTodaySpecial && <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {item.category?.name || 'Uncategorized'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setItemToEdit(item);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-3 pb-3">
                <button
                  onClick={() => handleToggleAvailability(item.id)}
                  className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    item.isAvailable
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                      : 'bg-red-500/10 text-red-600 border border-red-500/30'
                  }`}
                >
                  {item.isAvailable ? (
                    <><ToggleRight className="w-4 h-4 text-emerald-500" /><span>In Stock — Tap to Toggle</span></>
                  ) : (
                    <><ToggleLeft className="w-4 h-4 text-red-500" /><span>Sold Out — Tap to Toggle</span></>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      <MenuItemFormModal
        isOpen={isModalOpen}
        itemToEdit={itemToEdit}
        categories={categories}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />
    </AdminLayout>
  );
};
