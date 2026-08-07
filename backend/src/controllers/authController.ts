import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { signToken } from '../config/jwt.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      restaurantName,
      tagline,
      phone,
      address,
      currency = 'Nu ',
      tableCount = 6,
    } = req.body;

    if (!name || !email || !password || !restaurantName) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and restaurant name are required.',
      });
    }

    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An admin account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const slug = restaurantName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `restaurant-${Date.now()}`;

    // Create Restaurant record
    const restaurant = await prisma.restaurant.create({
      data: {
        name: restaurantName,
        slug: slug,
        tagline: tagline || 'Authentic Flavors & Fresh Ingredients',
        phone: phone || '+1 (555) 000-0000',
        email: email,
        address: address || 'Main Street',
        currency: currency,
        tableCount: Number(tableCount) || 6,
      },
    });

    // Create Admin record linked to Restaurant
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        restaurantId: restaurant.id,
      },
    });

    // Seed default starter categories and items for this new restaurant
    const startersCategory = await prisma.category.create({
      data: {
        name: 'Starters',
        slug: `starters-${restaurant.id.slice(0, 6)}`,
        description: 'Appetizers & finger foods',
        sortOrder: 1,
        restaurantId: restaurant.id,
      },
    });

    const mainsCategory = await prisma.category.create({
      data: {
        name: 'Main Course',
        slug: `mains-${restaurant.id.slice(0, 6)}`,
        description: 'Hearty entrees & chef specials',
        sortOrder: 2,
        restaurantId: restaurant.id,
      },
    });

    const drinksCategory = await prisma.category.create({
      data: {
        name: 'Beverages',
        slug: `drinks-${restaurant.id.slice(0, 6)}`,
        description: 'Refreshing drinks & coffees',
        sortOrder: 3,
        restaurantId: restaurant.id,
      },
    });

    // Add initial starter menu items
    await prisma.menuItem.createMany({
      data: [
        {
          name: 'Crispy Garlic Wings',
          description: 'Deep fried chicken wings tossed in rich garlic butter sauce',
          price: 250,
          imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop',
          categoryId: startersCategory.id,
          restaurantId: restaurant.id,
          isAvailable: true,
          isTodaySpecial: true,
          sortOrder: 1,
        },
        {
          name: 'Signature House Burger',
          description: 'Juicy patty topped with melted cheese, lettuce, and secret house sauce',
          price: 350,
          imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
          categoryId: mainsCategory.id,
          restaurantId: restaurant.id,
          isAvailable: true,
          isTodaySpecial: true,
          sortOrder: 1,
        },
        {
          name: 'Fresh Mint Lemonade',
          description: 'Chilled freshly squeezed lemon with crushed mint leaves',
          price: 120,
          imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop',
          categoryId: drinksCategory.id,
          restaurantId: restaurant.id,
          isAvailable: true,
          isTodaySpecial: false,
          sortOrder: 1,
        },
      ],
    });

    // Create Tables
    const totalTablesToCreate = Math.min(Math.max(Number(tableCount) || 6, 1), 50);
    const tableData = [];
    for (let i = 1; i <= totalTablesToCreate; i++) {
      tableData.push({
        number: i,
        restaurantId: restaurant.id,
        isOccupied: false,
      });
    }
    await prisma.table.createMany({ data: tableData });

    const token = signToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      restaurantId: restaurant.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Restaurant registered successfully!',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        restaurantId: restaurant.id,
      },
      restaurant,
    });
  } catch (error: any) {
    console.error('❌ Registration Error Details:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during restaurant registration.',
      details: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
      include: { restaurant: true },
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = signToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      restaurantId: admin.restaurantId || undefined,
    });

    return res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        restaurantId: admin.restaurantId,
      },
      restaurant: admin.restaurant,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        restaurantId: true,
        restaurant: true,
      },
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        restaurantId: admin.restaurantId,
      },
      restaurant: admin.restaurant,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
