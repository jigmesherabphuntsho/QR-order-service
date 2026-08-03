import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, QrCode, User, FileText, ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    tableNumber,
    setTableNumber,
    customerName,
    setCustomerName,
    orderNotes,
    setOrderNotes,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalAmount,
    totalItems,
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableInput, setTableInput] = useState<string>(tableNumber ? tableNumber.toString() : '1');

  React.useEffect(() => {
    if (tableNumber) {
      setTableInput(tableNumber.toString());
    }
  }, [tableNumber]);

  if (!isCartOpen) return null;


  const handlePlaceOrder = async () => {
    const finalTable = parseInt(tableInput) || tableNumber || 1;
    if (!finalTable || finalTable < 1) {
      toast.error('Please enter a valid table number.');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      setTableNumber(finalTable);

      const orderData = {
        tableNumber: finalTable,
        customerName: customerName.trim() || 'Guest Customer',
        notes: orderNotes.trim() || undefined,
        items: cart.map((ci) => ({
          menuItemId: ci.menuItem.id,
          quantity: ci.quantity,
          notes: ci.notes,
        })),
      };

      const res = await api.createOrder(orderData);

      if (res.success && res.order) {
        toast.success(`Order #${res.order.orderNumber} placed successfully!`);
        clearCart();
        setIsCartOpen(false);
        navigate(`/order-success?orderId=${res.order.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-500 text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-slate-900 dark:text-white font-serif">
                  Your Food Tray
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body - Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                  Your cart is empty
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  Scan table QR code or explore today's menu to add your favorite dishes!
                </p>
              </div>
            ) : (
              <>
                {/* Table & Customer Details Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-4 h-4 text-brand-500 shrink-0" />
                    <div className="flex-1 flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Table Number:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={tableInput}
                        onChange={(e) => setTableInput(e.target.value)}
                        className="w-16 px-2 py-1 text-center font-bold text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-brand-500 shrink-0" />
                    <input
                      type="text"
                      placeholder="Your Name (Optional)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.menuItem.id}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center gap-3"
                    >
                      <img
                        src={item.menuItem.imageUrl}
                        alt={item.menuItem.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {item.menuItem.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.menuItem.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs font-extrabold text-brand-600 dark:text-brand-400 mt-0.5">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </p>
                        {item.notes && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium truncate mt-0.5">
                            Note: "{item.notes}"
                          </p>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Overall Order Notes */}
                <div className="space-y-1.5 pt-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Kitchen Order Note:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bring cutlery & extra ice"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Items Total</span>
                  <span className="font-semibold text-slate-900 dark:text-white">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Taxes & Service Fee</span>
                  <span className="font-semibold text-emerald-600">Included</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Grand Total</span>
                  <span className="text-brand-600 dark:text-brand-400">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending Order to Kitchen...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Order • Table #{tableInput}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
