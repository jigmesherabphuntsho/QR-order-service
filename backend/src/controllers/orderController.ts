import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { emitNewOrder, emitOrderStatusUpdate } from '../services/socketService.js';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { tableNumber, customerName, items, notes } = req.body;

    if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Table number and order items are required.' });
    }

    // Verify items exist and calculate total
    let totalAmount = 0;
    const orderItemsData: Array<{ menuItemId: string; quantity: number; price: number; notes?: string }> = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!menuItem) {
        return res.status(400).json({ success: false, message: `Menu item with ID ${item.menuItemId} not found.` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ success: false, message: `"${menuItem.name}" is currently unavailable.` });
      }

      const itemPrice = menuItem.price;
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      totalAmount += itemPrice * quantity;

      orderItemsData.push({
        menuItemId: menuItem.id,
        quantity,
        price: itemPrice,
        notes: item.notes || null,
      });
    }

    // Generate consecutive Order Number
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1001;

    // Create Order in DB
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        tableNumber: parseInt(tableNumber),
        customerName: customerName ? customerName.trim() : 'Guest',
        totalAmount,
        notes: notes || null,
        status: 'PENDING',
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: { id: true, name: true, imageUrl: true, price: true },
            },
          },
        },
      },
    });

    // Mark table as occupied
    await prisma.table.updateMany({
      where: { number: parseInt(tableNumber) },
      data: { isOccupied: true },
    });

    // Broadcast Real-time WebSocket event to Kitchen Display & Admin
    emitNewOrder(newOrder);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { status, tableNumber, startDate, endDate, page = '1', limit = '10' } = req.query;

    const where: any = {};
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }
    if (tableNumber && typeof tableNumber === 'string') {
      where.tableNumber = parseInt(tableNumber);
    }
    if (startDate && typeof startDate === 'string' && startDate.trim() !== '') {
      const start = new Date(startDate.includes('T') ? startDate : `${startDate}T00:00:00.000`);
      if (!isNaN(start.getTime())) {
        where.createdAt = { ...(where.createdAt || {}), gte: start };
      }
    }
    if (endDate && typeof endDate === 'string' && endDate.trim() !== '') {
      const end = new Date(endDate.includes('T') ? endDate : `${endDate}T23:59:59.999`);
      if (!isNaN(end.getTime())) {
        where.createdAt = { ...(where.createdAt || {}), lte: end };
      }
    }

    const pageNum = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            menuItem: {
              select: { id: true, name: true, imageUrl: true, price: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });

    const total = await prisma.order.count({ where });

    return res.json({ success: true, page: pageNum, limit: pageSize, total, orders });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: {
              select: { id: true, name: true, imageUrl: true, price: true },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, order });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: {
              select: { id: true, name: true, imageUrl: true, price: true },
            },
          },
        },
      },
    });

    // If served or cancelled, check if any other pending/preparing orders for this table
    if (status === 'SERVED' || status === 'CANCELLED') {
      const activeOrdersCount = await prisma.order.count({
        where: {
          tableNumber: updatedOrder.tableNumber,
          status: { in: ['PENDING', 'PREPARING', 'READY'] },
        },
      });

      if (activeOrdersCount === 0) {
        await prisma.table.updateMany({
          where: { number: updatedOrder.tableNumber },
          data: { isOccupied: false },
        });
      }
    }

    // Broadcast Real-time WebSocket update to both admin and customer tracker
    emitOrderStatusUpdate(updatedOrder);

    return res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: today },
      },
    });

    const totalRevenue = todayOrders
      .filter((o: any) => o.status !== 'CANCELLED')
      .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

    const pendingCount = todayOrders.filter((o: any) => o.status === 'PENDING').length;
    const preparingCount = todayOrders.filter((o: any) => o.status === 'PREPARING').length;
    const readyCount = todayOrders.filter((o: any) => o.status === 'READY').length;

    const totalTables = await prisma.table.count();
    const occupiedTables = await prisma.table.count({ where: { isOccupied: true } });

    return res.json({
      success: true,
      stats: {
        todayTotalOrders: todayOrders.length,
        todayRevenue: totalRevenue,
        pendingOrders: pendingCount,
        preparingOrders: preparingCount,
        readyOrders: readyCount,
        totalTables,
        occupiedTables,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBusinessAnalytics = async (req: Request, res: Response) => {
  try {
    const { period = 'THIS_MONTH', startDate, endDate } = req.query;

    const now = new Date();
    let start: Date;
    let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (period === 'THIS_WEEK') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
    } else if (period === 'LAST_30_DAYS') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'THIS_YEAR') {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    } else if (period === 'CUSTOM' && startDate && endDate && typeof startDate === 'string' && typeof endDate === 'string') {
      start = new Date(`${startDate}T00:00:00.000`);
      end = new Date(`${endDate}T23:59:59.999`);
    } else {
      // Default: THIS_MONTH
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: { id: true, name: true, price: true, imageUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const validOrders = orders.filter((o: any) => o.status !== 'CANCELLED');
    const totalOrdersCount = orders.length;
    const completedOrdersCount = validOrders.length;
    const totalRevenue = validOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
    const averageOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;
    const fulfillmentRate = totalOrdersCount > 0 ? (completedOrdersCount / totalOrdersCount) * 100 : 0;

    // 1. Trending / Top Selling Food
    const itemMap = new Map<string, { id: string; name: string; imageUrl?: string; totalQty: number; totalSales: number }>();

    for (const order of validOrders) {
      for (const item of order.items) {
        const menuItemId = item.menuItemId || item.menuItem?.id || 'unknown';
        const name = item.menuItem?.name || 'Unnamed Dish';
        const imageUrl = item.menuItem?.imageUrl;
        const qty = item.quantity || 1;
        const sales = (item.price || item.menuItem?.price || 0) * qty;

        if (itemMap.has(menuItemId)) {
          const existing = itemMap.get(menuItemId)!;
          existing.totalQty += qty;
          existing.totalSales += sales;
        } else {
          itemMap.set(menuItemId, { id: menuItemId, name, imageUrl, totalQty: qty, totalSales: sales });
        }
      }
    }

    const trendingItems = Array.from(itemMap.values())
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 6);

    // 2. Weekly Breakdown (Last 7 days)
    const last7Days: { date: string; dayName: string; sales: number; orderCount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString([], { weekday: 'short' });

      const dayOrders = orders.filter((o: any) => {
        const oDate = new Date(o.createdAt).toISOString().split('T')[0];
        return oDate === dateStr && o.status !== 'CANCELLED';
      });

      const daySales = dayOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
      last7Days.push({ date: dateStr, dayName, sales: daySales, orderCount: dayOrders.length });
    }

    // 3. Monthly Breakdown (Last 12 months)
    const last12Months: { monthKey: string; monthName: string; sales: number; orderCount: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleDateString([], { month: 'short', year: '2-digit' });

      const monthOrders = orders.filter((o: any) => {
        const oDate = new Date(o.createdAt);
        return oDate.getFullYear() === year && oDate.getMonth() === month && o.status !== 'CANCELLED';
      });

      const monthSales = monthOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
      last12Months.push({ monthKey, monthName, sales: monthSales, orderCount: monthOrders.length });
    }

    // 4. Peak Dining Hours Analysis (0-23)
    const hourlyMap: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourlyMap[h] = 0;

    for (const order of validOrders) {
      const hour = new Date(order.createdAt).getHours();
      hourlyMap[hour] = (hourlyMap[hour] || 0) + 1;
    }

    const peakHours = Object.entries(hourlyMap).map(([hour, count]) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      hourNum: Number(hour),
      orderCount: count,
    }));

    return res.json({
      success: true,
      period,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      analytics: {
        totalRevenue,
        totalOrdersCount,
        completedOrdersCount,
        averageOrderValue,
        fulfillmentRate,
        trendingItems,
        weeklySales: last7Days,
        monthlySales: last12Months,
        peakHours,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
