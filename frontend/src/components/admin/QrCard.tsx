import React, { useEffect, useRef, useState } from 'react';
import { Download, QrCode, UtensilsCrossed, ExternalLink, Pencil, Save, RotateCcw, Trash2, Copy, Check } from 'lucide-react';
import { TableInfo, Restaurant } from '../../types';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface QrCardProps {
  table: TableInfo;
  restaurant: Restaurant | null;
  onDelete?: (tableNumber: number) => void;
  onUpdate?: () => void;
}

export const QrCard: React.FC<QrCardProps> = ({ table, restaurant, onDelete, onUpdate }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [customUrl, setCustomUrl] = useState(table.qrUrl || '');
  const [currentQrUrl, setCurrentQrUrl] = useState(table.qrUrl || '');
  const [currentQrDataUrl, setCurrentQrDataUrl] = useState(table.qrDataUrl || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setCustomUrl(table.qrUrl || '');
    setCurrentQrUrl(table.qrUrl || '');
    setCurrentQrDataUrl(table.qrDataUrl || '');
  }, [table.qrUrl, table.qrDataUrl]);

  const handleDownloadPNG = () => {
    if (!currentQrDataUrl) return;

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border Frame
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Header Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.fillText(restaurant?.name || 'Gourmet Haven', canvas.width / 2, 90);

    // Subtitle
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('SCAN QR CODE TO ORDER & PAY', canvas.width / 2, 130);

    // QR Image
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 100, 170, 400, 400);

      // Table Footer
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(100, 600, 400, 100);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(`TABLE #${table.number}`, canvas.width / 2, 665);

      // Instructions
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText('No app download required • Instant order', canvas.width / 2, 740);

      // Download trigger
      const link = document.createElement('a');
      link.download = `Table-${table.number}-QR.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success(`Downloaded QR Code for Table #${table.number}`);
    };
    qrImg.src = currentQrDataUrl;
  };

  const handleCopyLink = () => {
    if (!currentQrUrl) return;
    navigator.clipboard.writeText(currentQrUrl);
    setIsCopied(true);
    toast.success(`Link for Table #${table.number} copied!`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveUrl = async () => {
    try {
      setIsSaving(true);
      const response = await api.updateTableQR(table.number, customUrl.trim(), window.location.origin);
      if (response.success) {
        setCurrentQrUrl(response.url);
        setCurrentQrDataUrl(response.qrDataUrl);
        setCustomUrl(response.url);
        setIsEditing(false);
        toast.success(`Updated QR destination for Table #${table.number}`);
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not update QR destination');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetUrl = async () => {
    try {
      setIsSaving(true);
      const response = await api.updateTableQR(table.number, '', window.location.origin);
      if (response.success) {
        setCurrentQrUrl(response.url);
        setCurrentQrDataUrl(response.qrDataUrl);
        setCustomUrl(response.url);
        setIsEditing(false);
        toast.success(`Reset QR destination for Table #${table.number}`);
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not reset QR destination');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!window.confirm(`Are you sure you want to delete Table #${table.number}?`)) {
      return;
    }
    try {
      setIsDeleting(true);
      await api.deleteTable(table.number);
      toast.success(`Deleted Table #${table.number}`);
      if (onDelete) onDelete(table.number);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete table');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md hover:shadow-xl transition-all flex flex-col items-center text-center space-y-4 relative group"
    >
      {/* Table Badge & Actions */}
      <div className="w-full flex items-center justify-between">
        <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs">
          Table #{table.number}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              table.isOccupied
                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
            }`}
          >
            {table.isOccupied ? 'Occupied' : 'Vacant'}
          </span>

          <button
            onClick={handleDeleteTable}
            disabled={isDeleting}
            title="Delete Table"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="p-4 rounded-2xl bg-white border-2 border-dashed border-brand-500/40 shadow-sm flex flex-col items-center w-full">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
          <UtensilsCrossed className="w-3.5 h-3.5 text-brand-500" />
          <span>{restaurant?.name || 'Gourmet Haven'}</span>
        </div>

        {currentQrDataUrl ? (
          <img
            src={currentQrDataUrl}
            alt={`QR Code Table ${table.number}`}
            className="w-44 h-44 object-contain"
          />
        ) : (
          <div className="w-44 h-44 flex items-center justify-center text-slate-300">
            <QrCode className="w-12 h-12" />
          </div>
        )}

        <span className="text-[11px] font-extrabold text-brand-600 mt-1 uppercase tracking-wider">
          Scan to View Menu
        </span>
      </div>

      {/* Dynamic Link URL snippet */}
      <div className="w-full text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1">
        <span className="truncate">{currentQrUrl}</span>
        <button
          onClick={handleCopyLink}
          className="text-slate-500 hover:text-brand-500 font-bold flex-shrink-0"
          title="Copy Link"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Edit QR URL</span>
        </button>
      ) : (
        <div className="w-full space-y-2">
          <input
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://your-link.com/menu"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none font-mono"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSaveUrl}
              disabled={isSaving}
              className="py-2 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all disabled:opacity-70"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleResetUrl}
              disabled={isSaving}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-70"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      <div className="w-full grid grid-cols-2 gap-2 pt-2">
        <a
          href={currentQrUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Preview</span>
        </a>

        <button
          onClick={handleDownloadPNG}
          className="py-2 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
