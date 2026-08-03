import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Image as ImageIcon, Upload, Check, Loader2, Link as LinkIcon, Trash2, Camera } from 'lucide-react';
import { MenuItem, Category } from '../../types';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface MenuItemFormModalProps {
  isOpen: boolean;
  itemToEdit: MenuItem | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_IMAGES = [
  { label: 'Steak', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
  { label: 'Pizza', url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Salmon', url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80' },
  { label: 'Salad', url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=800&q=80' },
  { label: 'Fries', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dessert', url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80' },
  { label: 'Drink', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80' },
];

export const MenuItemFormModal: React.FC<MenuItemFormModalProps> = ({
  isOpen,
  itemToEdit,
  categories,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isTodaySpecial, setIsTodaySpecial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setDescription(itemToEdit.description);
      setPrice(itemToEdit.price.toString());
      setImageUrl(itemToEdit.imageUrl);
      setCategoryId(itemToEdit.categoryId);
      setIsAvailable(itemToEdit.isAvailable);
      setIsTodaySpecial(itemToEdit.isTodaySpecial);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl(PRESET_IMAGES[0].url);
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setIsAvailable(true);
      setIsTodaySpecial(true);
    }
  }, [itemToEdit, categories]);

  // Client-side image resize & compression helper
  const processUploadedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setImageUrl(e.target?.result as string);
          setIsProcessingImage(false);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImageUrl(resizedDataUrl);
        setIsProcessingImage(false);
        toast.success('Dish image loaded and optimized!');
      };

      img.onerror = () => {
        toast.error('Failed to process image file');
        setIsProcessingImage(false);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      toast.error('Error reading image file');
      setIsProcessingImage(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processUploadedFile(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) {
      toast.error('Please fill in required fields: Name, Price, and Category.');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = {
        name,
        description,
        price: parseFloat(price),
        imageUrl: imageUrl || PRESET_IMAGES[0].url,
        categoryId,
        isAvailable,
        isTodaySpecial,
        sortOrder: itemToEdit ? itemToEdit.sortOrder : 0,
      };

      if (itemToEdit) {
        await api.updateMenuItem(itemToEdit.id, data);
        toast.success('Menu item updated!');
      } else {
        await api.createMenuItem(data);
        toast.success('New menu item created!');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white font-serif">
            {itemToEdit ? 'Edit Menu Item' : 'Create New Menu Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Truffle Ribeye Steak"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="14.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Ingredients, preparation style..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Image Selection Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Dish Image
              </label>

              {/* Mode Toggle Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    imageTab === 'upload'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload / Click Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    imageTab === 'url'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Web URL / Presets</span>
                </button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Live Image Preview Card */}
            {imageUrl && (
              <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-36 bg-slate-950/20 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Dish preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Camera className="w-3.5 h-3.5 text-brand-500" />
                    <span>Change Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="p-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md"
                    title="Remove Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Tab 1: Upload / Click Box */}
            {imageTab === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-center"
              >
                {isProcessingImage ? (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                    <span className="text-xs font-bold">Optimizing dish photo...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-2">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Click here to select an image from your device
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      Supports JPG, PNG, WEBP • Drag & drop supported
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Tab 2: URL & Quick Presets */}
            {imageTab === 'url' && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />

                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium border shrink-0 transition-all ${
                        imageUrl === preset.url
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 text-brand-500 rounded accent-brand-500"
              />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Available for Order
              </span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isTodaySpecial}
                onChange={(e) => setIsTodaySpecial(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded accent-amber-500"
              />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Show in Today's Menu
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isProcessingImage}
              className="flex-1 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>{itemToEdit ? 'Save Changes' : 'Create Item'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
