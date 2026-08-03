import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../config/db.js';

import os from 'os';

export const getSystemNetworkIp = (): string => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const resolveBaseUrl = (req: Request): string => {
  const queryBase = req.query.baseUrl as string;
  const bodyBase = req.body?.baseUrl as string;
  const passedBase = queryBase || bodyBase;
  if (passedBase && /^https?:\/\//i.test(passedBase.trim())) {
    return passedBase.trim().replace(/\/+$/, '');
  }

  const systemIp = getSystemNetworkIp();
  let baseCandidate = '';

  const origin = req.headers.origin || req.headers.referer;
  if (origin && typeof origin === 'string') {
    try {
      const parsed = new URL(origin);
      baseCandidate = `${parsed.protocol}//${parsed.host}`;
    } catch {
      // Fallthrough
    }
  }

  if (!baseCandidate) {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    if (host && typeof host === 'string') {
      const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      baseCandidate = `${proto}://${host}`;
    }
  }

  if (!baseCandidate) {
    baseCandidate = process.env.CLIENT_URL || 'http://localhost:3000';
  }

  // Automatically replace localhost / 127.0.0.1 with real LAN IP for mobile QR scanning
  if (systemIp !== 'localhost') {
    baseCandidate = baseCandidate.replace(/localhost|127\.0\.0\.1/gi, systemIp);
  }

  return baseCandidate.replace(/\/+$/, '');
};

const buildQrTargetUrl = (clientUrl: string, tableNumber: number, customUrl?: string | null) => {
  const trimmed = customUrl?.trim();
  if (trimmed) {
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    if (trimmed.startsWith('/')) {
      return `${clientUrl}${trimmed}`;
    }
    return `${clientUrl}/${trimmed.replace(/^\/+/, '')}`;
  }

  return `${clientUrl}/menu?table=${tableNumber}`;
};

export const getTables = async (req: Request, res: Response) => {
  try {
    const clientUrl = resolveBaseUrl(req);
    let tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
    });

    if (tables.length === 0) {
      // Ensure default tables exist
      const restaurant = await prisma.restaurant.findFirst();
      const count = restaurant ? restaurant.tableCount : 12;
      for (let i = 1; i <= count; i++) {
        await prisma.table.create({ data: { number: i, isOccupied: false } });
      }
      tables = await prisma.table.findMany({ orderBy: { number: 'asc' } });
    }

    // Attach dynamic QR Data URL to each table object
    const tablesWithQR = await Promise.all(
      tables.map(async (t: any) => {
        const qrContent = buildQrTargetUrl(clientUrl, t.number, t.qrCodeUrl);

        const dataUrl = await QRCode.toDataURL(qrContent, {
          width: 300,
          margin: 2,
          color: {
            dark: '#1e293b',
            light: '#ffffff',
          },
        });
        return {
          ...t,
          qrUrl: qrContent,
          qrDataUrl: dataUrl,
        };
      })
    );

    return res.json({ success: true, count: tablesWithQR.length, tables: tablesWithQR });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const generateTableQR = async (req: Request, res: Response) => {
  try {
    const { tableNumber } = req.params;
    const clientUrl = resolveBaseUrl(req);
    const table = await prisma.table.findFirst({ where: { number: parseInt(tableNumber) } });

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    const qrContent = buildQrTargetUrl(clientUrl, table.number, table.qrCodeUrl);

    const dataUrl = await QRCode.toDataURL(qrContent, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    return res.json({
      success: true,
      tableNumber: table.number,
      url: qrContent,
      qrDataUrl: dataUrl,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTableQR = async (req: Request, res: Response) => {
  try {
    const { tableNumber } = req.params;
    const clientUrl = resolveBaseUrl(req);
    const rawUrl = req.body?.url;
    const customUrl = typeof rawUrl === 'string' ? rawUrl.trim() : '';

    const table = await prisma.table.findFirst({ where: { number: parseInt(tableNumber) } });
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    const updatedTable = await prisma.table.update({
      where: { id: table.id },
      data: {
        qrCodeUrl: customUrl || null,
      },
    });

    const qrContent = buildQrTargetUrl(clientUrl, updatedTable.number, updatedTable.qrCodeUrl);
    const dataUrl = await QRCode.toDataURL(qrContent, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    return res.json({
      success: true,
      tableNumber: updatedTable.number,
      url: qrContent,
      qrDataUrl: dataUrl,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTable = async (req: Request, res: Response) => {
  try {
    const { number, qrCodeUrl } = req.body;
    const tableNumber = parseInt(number);

    if (isNaN(tableNumber) || tableNumber <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid positive table number' });
    }

    const existing = await prisma.table.findFirst({ where: { number: tableNumber } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Table #${tableNumber} already exists` });
    }

    const newTable = await prisma.table.create({
      data: {
        number: tableNumber,
        qrCodeUrl: typeof qrCodeUrl === 'string' ? qrCodeUrl.trim() : null,
        isOccupied: false,
      },
    });

    // Also update restaurant tableCount if needed
    const restaurant = await prisma.restaurant.findFirst();
    if (restaurant && newTable.number > restaurant.tableCount) {
      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { tableCount: newTable.number },
      });
    }

    const clientUrl = resolveBaseUrl(req);
    const qrContent = buildQrTargetUrl(clientUrl, newTable.number, newTable.qrCodeUrl);
    const dataUrl = await QRCode.toDataURL(qrContent, {
      width: 400,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    });

    return res.status(201).json({
      success: true,
      table: {
        ...newTable,
        qrUrl: qrContent,
        qrDataUrl: dataUrl,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTable = async (req: Request, res: Response) => {
  try {
    const { tableNumber } = req.params;
    const num = parseInt(tableNumber);

    const table = await prisma.table.findFirst({ where: { number: num } });
    if (!table) {
      return res.status(404).json({ success: false, message: `Table #${tableNumber} not found` });
    }

    await prisma.table.delete({ where: { id: table.id } });

    return res.json({ success: true, message: `Table #${num} deleted successfully`, tableNumber: num });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getNetworkInfo = async (req: Request, res: Response) => {
  const ip = getSystemNetworkIp();
  const port = process.env.PORT || '3000';
  return res.json({
    success: true,
    ip,
    networkUrl: `http://${ip}:${port}`,
  });
};
