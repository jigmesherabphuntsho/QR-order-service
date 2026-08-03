import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Globe, Download, Copy, ExternalLink, PlusCircle, Check, UtensilsCrossed, Smartphone, AlertCircle } from 'lucide-react';
import { Restaurant } from '../../types';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface DynamicQrGeneratorProps {
  restaurant: Restaurant | null;
  onTableCreated?: () => void;
}

export const DynamicQrGenerator: React.FC<DynamicQrGeneratorProps> = ({ restaurant, onTableCreated }) => {
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [domainUrl, setDomainUrl] = useState<string>(window.location.origin);
  const [detectedNetworkUrl, setDetectedNetworkUrl] = useState<string>('');
  const [customPath, setCustomPath] = useState<string>('');
  const [generatedQrDataUrl, setGeneratedQrDataUrl] = useState<string>('');
  const [fullUrl, setFullUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // 1. Fetch server network IP info on mount
  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        const res = await api.getNetworkInfo();
        if (res.success && res.ip && res.ip !== 'localhost') {
          const port = window.location.port ? `:${window.location.port}` : '';
          const wifiUrl = `http://${res.ip}${port}`;
          setDetectedNetworkUrl(wifiUrl);

          // If the user accessed admin via localhost, auto-switch default domainUrl to Wi-Fi Network IP for mobile scanning!
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setDomainUrl(wifiUrl);
          }
        }
      } catch (err) {
        console.error('Could not fetch network info:', err);
      }
    };
    fetchNetworkInfo();
  }, []);

  // 2. Derive the target full URL dynamically
  useEffect(() => {
    let base = domainUrl.trim();
    if (!base) base = window.location.origin;
    base = base.replace(/\/+$/, '');

    let finalLink = '';
    const path = customPath.trim();

    if (path) {
      if (/^https?:\/\//i.test(path)) {
        finalLink = path;
      } else if (path.startsWith('/')) {
        finalLink = `${base}${path}`;
      } else {
        finalLink = `${base}/${path}`;
      }
    } else {
      finalLink = `${base}/menu?table=${tableNumber}`;
    }

    setFullUrl(finalLink);

    // Generate real-time live QR code image
    if (finalLink) {
      QRCode.toDataURL(finalLink, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setGeneratedQrDataUrl(url))
        .catch((err) => console.error('QR Live Generation error:', err));
    }
  }, [tableNumber, domainUrl, customPath]);

  const handleAutoDetectDomain = () => {
    if (detectedNetworkUrl) {
      setDomainUrl(detectedNetworkUrl);
      toast.success(`Domain set to Mobile Wi-Fi URL: ${detectedNetworkUrl}`);
    } else {
      const currentOrigin = window.location.origin;
      setDomainUrl(currentOrigin);
      toast.success(`Domain set to: ${currentOrigin}`);
    }
  };

  const handleCopyLink = () => {
    if (!fullUrl) return;
    navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    toast.success('Dynamic order link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveTable = async () => {
    if (!tableNumber || tableNumber <= 0) {
      toast.error('Please enter a valid positive table number');
      return;
    }

    try {
      setIsSaving(true);
      await api.createTable(
        {
          number: tableNumber,
          qrCodeUrl: customPath.trim() || undefined,
        },
        domainUrl
      );
      toast.success(`Table #${tableNumber} created successfully!`);
      if (onTableCreated) onTableCreated();
    } catch (err: any) {
      toast.error(err.message || 'Could not save table');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPNG = () => {
    if (!generatedQrDataUrl) return;

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

      // Table Footer Badge
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(100, 600, 400, 100);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(`TABLE #${tableNumber}`, canvas.width / 2, 665);

      // Sub-text / Instructions
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.fillText('No app required • Instant Digital Order', canvas.width / 2, 740);

      // Download
      const link = document.createElement('a');
      link.download = `Table-${tableNumber}-QR.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success(`Downloaded QR Card for Table #${tableNumber}`);
    };
    qrImg.src = generatedQrDataUrl;
  };

  const isLocalhostDomain = domainUrl.includes('localhost') || domainUrl.includes('127.0.0.1');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-brand-500" />
            <span>Interactive Dynamic QR Code Generator</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Insert a table number and domain to generate instant scan & order links dynamically.
          </p>
        </div>

        <button
          onClick={handleAutoDetectDomain}
          className="px-3.5 py-2 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 text-xs font-bold flex items-center gap-1.5 hover:bg-brand-100 transition-all self-start sm:self-auto"
        >
          <Smartphone className="w-4 h-4 text-emerald-500" />
          <span>Use Mobile Wi-Fi IP</span>
        </button>
      </div>

      {/* Localhost Warning Banner */}
      {isLocalhostDomain && detectedNetworkUrl && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Tip for Mobile Scanning:</strong> <code>localhost</code> only works on your PC. Use <strong>{detectedNetworkUrl}</strong> so smartphones on Wi-Fi can scan and open the menu.
            </span>
          </div>
          <button
            onClick={() => setDomainUrl(detectedNetworkUrl)}
            className="px-3 py-1 bg-amber-600 text-white font-bold text-[11px] rounded-xl hover:bg-amber-700 transition-colors flex-shrink-0"
          >
            Use Wi-Fi IP
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Table Number Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              1. Table Number
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={tableNumber}
                onChange={(e) => setTableNumber(parseInt(e.target.value) || 1)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. 5"
              />
              <span className="absolute right-4 top-3 text-xs font-semibold text-slate-400">
                Table #
              </span>
            </div>
          </div>

          {/* Access Domain / Base Host */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                2. Base Access URL / Domain (IP or Web Address)
              </label>
              {detectedNetworkUrl && (
                <button
                  onClick={() => setDomainUrl(detectedNetworkUrl)}
                  className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  <span>Wi-Fi IP: {detectedNetworkUrl}</span>
                </button>
              )}
            </div>
            <input
              type="text"
              value={domainUrl}
              onChange={(e) => setDomainUrl(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              placeholder="e.g. http://192.168.1.101:3000 or https://gourmethaven.com"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              For smartphone ordering over local Wi-Fi, use your local Wi-Fi IP address (e.g. <code>http://192.168.1.101:3000</code>).
            </p>
          </div>

          {/* Custom Path Override */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              3. Optional Custom Destination Path / Full URL
            </label>
            <input
              type="text"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              placeholder="Leave empty for default (/menu?table=X)"
            />
          </div>

          {/* Final Generated Link Display */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>Final Embedded QR Destination URL</span>
              <button
                onClick={handleCopyLink}
                className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-bold text-[11px]"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
            <div className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 break-all bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {fullUrl}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleSaveTable}
              disabled={isSaving}
              className="px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all disabled:opacity-70"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : `Save Table #${tableNumber} to System`}</span>
            </button>

            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Test Preview Link</span>
            </a>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200">
              <UtensilsCrossed className="w-3.5 h-3.5 text-brand-500" />
              <span>{restaurant?.name || 'Gourmet Haven'}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Live QR Preview Card
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-brand-500/40 shadow-md flex flex-col items-center">
            {generatedQrDataUrl ? (
              <img
                src={generatedQrDataUrl}
                alt={`Table ${tableNumber} QR`}
                className="w-52 h-52 object-contain"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-slate-300">
                <QrCode className="w-12 h-12" />
              </div>
            )}
            <div className="mt-2 px-3 py-1 bg-brand-500 text-white font-extrabold text-xs rounded-lg uppercase tracking-wide">
              Table #{tableNumber}
            </div>
          </div>

          <button
            onClick={handleDownloadPNG}
            className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Printable QR Card (PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
