import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.query;
    const reqRestaurantId = (req as AuthenticatedRequest).user?.restaurantId || (restaurantId as string);

    const where: any = {};
    if (reqRestaurantId) {
      where.restaurantId = reqRestaurantId;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
    return res.json({ success: true, categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, sortOrder } = req.body;
    const reqRestaurantId = (req as AuthenticatedRequest).user?.restaurantId;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${reqRestaurantId ? reqRestaurantId.slice(0, 6) : Date.now()}`;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        restaurantId: reqRestaurantId || null,
      },
    });

    return res.status(201).json({ success: true, category });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, sortOrder } = req.body;

    const dataToUpdate: any = {};
    if (name) {
      dataToUpdate.name = name;
    }
    if (description !== undefined) dataToUpdate.description = description;
    if (sortOrder !== undefined) dataToUpdate.sortOrder = parseInt(sortOrder);

    const category = await prisma.category.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.json({ success: true, category });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
