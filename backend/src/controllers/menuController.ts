import { Request, Response } from 'express';
import { prisma } from '../config/db.js';

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { categoryId, search, availableOnly, todayOnly } = req.query;

    const where: any = {};

    if (categoryId && typeof categoryId === 'string' && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    if (availableOnly === 'true') {
      where.isAvailable = true;
    }

    if (todayOnly === 'true') {
      where.isTodaySpecial = true;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.menuItem.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return res.json({ success: true, count: items.length, items });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    return res.json({ success: true, item });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { name, description, price, imageUrl, categoryId, isAvailable, isTodaySpecial, sortOrder } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required.' });
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        categoryId,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        isTodaySpecial: isTodaySpecial !== undefined ? Boolean(isTodaySpecial) : true,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      },
      include: { category: true },
    });

    return res.status(201).json({ success: true, item });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, categoryId, isAvailable, isTodaySpecial, sortOrder } = req.body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description;
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl;
    if (categoryId !== undefined) dataToUpdate.categoryId = categoryId;
    if (isAvailable !== undefined) dataToUpdate.isAvailable = Boolean(isAvailable);
    if (isTodaySpecial !== undefined) dataToUpdate.isTodaySpecial = Boolean(isTodaySpecial);
    if (sortOrder !== undefined) dataToUpdate.sortOrder = parseInt(sortOrder);

    const item = await prisma.menuItem.update({
      where: { id },
      data: dataToUpdate,
      include: { category: true },
    });

    return res.json({ success: true, item });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const current = await prisma.menuItem.findUnique({ where: { id } });
    if (!current) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !current.isAvailable },
    });

    return res.json({ success: true, item: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.menuItem.delete({ where: { id } });
    return res.json({ success: true, message: 'Menu item deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
