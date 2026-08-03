import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../config/db.js';

export const getTables = async (req: Request, res: Response) => {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
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
        const qrContent = `${clientUrl}/menu?table=${t.number}`;
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
          qrUrl: `${clientUrl}/menu?table=${t.number}`,
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
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const qrContent = `${clientUrl}/menu?table=${tableNumber}`;

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
      tableNumber: parseInt(tableNumber),
      url: qrContent,
      qrDataUrl: dataUrl,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
