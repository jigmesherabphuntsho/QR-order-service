import { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const getRestaurant = async (req: Request, res: Response) => {
  try {
    let restaurant = await prisma.restaurant.findFirst();

    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          name: 'Gourmet Haven',
          tagline: 'Authentic Flavors & Fresh Ingredients',
          openingHours: '10:00 AM - 10:00 PM',
          phone: '+1 (555) 234-5678',
          email: 'info@gourmethaven.com',
          address: '123 Culinary St, Foodville',
          currency: '$',
          tableCount: 12,
        },
      });
    }

    return res.json({ success: true, restaurant });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const { name, tagline, openingHours, phone, email, address, currency, tableCount } = req.body;

    let restaurant = await prisma.restaurant.findFirst();

    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          name: name || 'Gourmet Haven',
          tagline: tagline || '',
          openingHours: openingHours || '10:00 AM - 10:00 PM',
          phone: phone || '',
          email: email || '',
          address: address || '',
          currency: currency || '$',
          tableCount: tableCount ? parseInt(tableCount) : 12,
        },
      });
    } else {
      const newTableCount = tableCount ? parseInt(tableCount) : restaurant.tableCount;

      restaurant = await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: {
          ...(name && { name }),
          ...(tagline !== undefined && { tagline }),
          ...(openingHours && { openingHours }),
          ...(phone && { phone }),
          ...(email && { email }),
          ...(address && { address }),
          ...(currency && { currency }),
          ...(tableCount && { tableCount: newTableCount }),
        },
      });

      // Synchronize tables in DB if tableCount increased
      const currentTablesCount = await prisma.table.count();
      if (newTableCount > currentTablesCount) {
        for (let i = currentTablesCount + 1; i <= newTableCount; i++) {
          await prisma.table.create({
            data: { number: i, isOccupied: false },
          });
        }
      }
    }

    return res.json({ success: true, restaurant });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
