import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getRestaurant = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.query;

    let restaurant;
    if (restaurantId && typeof restaurantId === 'string') {
      restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    }

    if (!restaurant) {
      restaurant = await prisma.restaurant.findFirst();
    }

    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          name: 'Gourmet Haven',
          tagline: 'Authentic Flavors & Fresh Ingredients',
          openingHours: '10:00 AM - 10:00 PM',
          phone: '+1 (555) 234-5678',
          email: 'info@gourmethaven.com',
          address: '123 Culinary St, Foodville',
          currency: 'Nu ',
          tableCount: 12,
        },
      });
    }

    return res.json({ success: true, restaurant });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRestaurant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, tagline, openingHours, phone, email, address, currency, tableCount } = req.body;
    const adminRestaurantId = req.user?.restaurantId;

    let restaurant;
    if (adminRestaurantId) {
      restaurant = await prisma.restaurant.findUnique({ where: { id: adminRestaurantId } });
    }
    if (!restaurant) {
      restaurant = await prisma.restaurant.findFirst();
    }

    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          name: name || 'Gourmet Haven',
          tagline: tagline || '',
          openingHours: openingHours || '10:00 AM - 10:00 PM',
          phone: phone || '',
          email: email || '',
          address: address || '',
          currency: currency || 'Nu ',
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

      // Synchronize tables for this restaurant if tableCount increased
      const currentTablesCount = await prisma.table.count({ where: { restaurantId: restaurant.id } });
      if (newTableCount > currentTablesCount) {
        for (let i = currentTablesCount + 1; i <= newTableCount; i++) {
          await prisma.table.create({
            data: { number: i, isOccupied: false, restaurantId: restaurant.id },
          });
        }
      }
    }

    return res.json({ success: true, restaurant });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
