import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const getClientUrl = (req: Request): string => {
  const queryBaseUrl = req.query.baseUrl as string;
  if (queryBaseUrl && typeof queryBaseUrl === 'string' && queryBaseUrl.trim() !== '') {
    return queryBaseUrl.trim().replace(/\/+$/, '');
  }
  const origin = req.headers.origin;
  if (origin && typeof origin === 'string' && origin.trim() !== '') {
    return origin.trim().replace(/\/+$/, '');
  }
  const referer = req.headers.referer;
  if (referer && typeof referer === 'string') {
    try {
      const url = new URL(referer);
      return url.origin;
    } catch {
      // Fall through
    }
  }
  return (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/+$/, '');
};

export const getTables = async (req: Request, res: Response) => {
  try {
    const clientUrl = getClientUrl(req);
    const reqRestaurantId = (req as AuthenticatedRequest).user?.restaurantId || (req.query.restaurantId as string);

    const where: any = {};
    if (reqRestaurantId) {
      where.restaurantId = reqRestaurantId;
    }

    let tables = await prisma.table.findMany({
      where,
      orderBy: { number: 'asc' },
    });

    if (tables.length === 0) {
      let restaurant;
      if (reqRestaurantId) {
        restaurant = await prisma.restaurant.findUnique({ where: { id: reqRestaurantId } });
      }
      if (!restaurant) {
        restaurant = await prisma.restaurant.findFirst();
      }

      const count = restaurant ? restaurant.tableCount : 6;
      for (let i = 1; i <= count; i++) {
        await prisma.table.create({
          data: { number: i, isOccupied: false, restaurantId: restaurant?.id || null },
        });
      }
      tables = await prisma.table.findMany({
        where,
        orderBy: { number: 'asc' },
      });
    }

    const tablesWithQR = await Promise.all(
      tables.map(async (t: any) => {
        const restParam = t.restaurantId ? `&restaurantId=${t.restaurantId}` : '';
        const qrContent = `${clientUrl}/menu?table=${t.number}${restParam}`;
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
    const clientUrl = getClientUrl(req);
    const num = parseInt(tableNumber, 10);
    const reqRestaurantId = (req as AuthenticatedRequest).user?.restaurantId || (req.query.restaurantId as string);

    if (isNaN(num) || num <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid table number' });
    }

    const restParam = reqRestaurantId ? `&restaurantId=${reqRestaurantId}` : '';
    const qrContent = `${clientUrl}/menu?table=${num}${restParam}`;

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
      tableNumber: num,
      url: qrContent,
      qrDataUrl: dataUrl,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTable = async (req: Request, res: Response) => {
  try {
    const { number } = req.body;
    const tableNumber = parseInt(number, 10);
    const reqRestaurantId = (req as AuthenticatedRequest).user?.restaurantId;

    if (isNaN(tableNumber) || tableNumber <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid table number greater than 0' });
    }

    const whereCheck: any = { number: tableNumber };
    if (reqRestaurantId) whereCheck.restaurantId = reqRestaurantId;

    const existing = await prisma.table.findFirst({
      where: whereCheck,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: `Table #${tableNumber} already exists` });
    }

    const newTable = await prisma.table.create({
      data: {
        number: tableNumber,
        isOccupied: false,
        restaurantId: reqRestaurantId || null,
      },
    });

    const clientUrl = getClientUrl(req);
    const restParam = reqRestaurantId ? `&restaurantId=${reqRestaurantId}` : '';
    const qrContent = `${clientUrl}/menu?table=${newTable.number}${restParam}`;
    const dataUrl = await QRCode.toDataURL(qrContent, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });

    return res.status(201).json({
      success: true,
      message: `Table #${tableNumber} created successfully`,
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
    const { id } = req.params;

    const existing = await prisma.table.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    await prisma.table.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: `Table #${existing.number} deleted successfully`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
