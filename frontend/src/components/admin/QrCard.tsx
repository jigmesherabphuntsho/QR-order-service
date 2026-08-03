import React, { useRef } from 'react';
import { Download, QrCode, UtensilsCrossed, ExternalLink, Copy, Trash2 } from 'lucide-react';
import { TableInfo, Restaurant } from '../../types';
import toast from 'react-hot-toast';

interface QrCardProps {
  table: TableInfo;
  restaurant: Restaurant | null;
  onDelete?: (id: string, number: number) => void;
}

export const QrCard: React.FC<QrCardProps> = ({ table, restaurant, onDelete }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = () => {
    if (table.qrUrl) {
      navigator.clipboard.writeText(table.qrUrl);
      toast.success(`Copied link for Table #${table.number}!`);
    }
  };

  const handleDownloadPNG = () => {
    if (!table.qrDataUrl) return;

    // Create canvas to composite restaurant header + QR + table number
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
    qrImg.src = table.qrDataUrl;
  };

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md hover:shadow-xl transition-all flex flex-col items-center text-center space-y-4 relative group"
    >
      {/* Top Header */}
      <div className="w-full flex items-center justify-between">
        <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs">
          Table #{table.number}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              table.isOccupied
                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
            }`}
          >
            {table.isOccupied ? 'Occupied' : 'Vacant'}
          </span>
          {onDelete && table.id && (
            <button
              onClick={() => onDelete(table.id, table.number)}
              title="Delete Table"
              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* QR Code Container */}
      <div className="w-full p-4 rounded-2xl bg-white border-2 border-dashed border-brand-500/40 shadow-sm flex flex-col items-center">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
          <UtensilsCrossed className="w-3.5 h-3.5 text-brand-500" />
          <span>{restaurant?.name || 'Gourmet Haven'}</span>
        </div>

        {table.qrDataUrl ? (
          <img
            src={table.qrDataUrl}
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

        {/* Dynamic Embedded Link URL Preview */}
        <div
          onClick={handleCopyLink}
          title="Click to copy dynamic link"
          className="mt-2 w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 font-mono truncate cursor-pointer hover:bg-slate-100 flex items-center justify-between gap-1 transition-colors"
        >
          <span className="truncate">{table.qrUrl || `/menu?table=${table.number}`}</span>
          <Copy className="w-3 h-3 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Actions */}
      <div className="w-full grid grid-cols-2 gap-2 pt-1">
        <a
          href={table.qrUrl}
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

