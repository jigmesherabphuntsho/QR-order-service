import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.restaurant.deleteMany();

  // 2. Create Restaurant Profile
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Gourmet Haven',
      tagline: 'Artisanal Cuisine & Handcrafted Cocktails',
      openingHours: '11:00 AM - 11:00 PM',
      phone: '+1 (555) 839-2001',
      email: 'contact@gourmethaven.com',
      address: '450 Grand Avenue, Downtown',
      currency: '$',
      tableCount: 12,
    },
  });
  console.log('✅ Restaurant created:', restaurant.name);

  // 3. Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.create({
    data: {
      name: 'Manager Admin',
      email: 'admin@restaurant.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created: admin@restaurant.com (password: admin123)');

  // 4. Create Tables (1 to 12)
  for (let i = 1; i <= 12; i++) {
    await prisma.table.create({
      data: {
        number: i,
        isOccupied: false,
      },
    });
  }
  console.log('✅ 12 Tables created');

  // 5. Create Categories & Menu Items
  const categories = [
    {
      name: 'Starters & Apps',
      slug: 'starters',
      description: 'Crispy, savory bites to begin your feast',
      sortOrder: 1,
      items: [
        {
          name: 'Truffle Parmesan Fries',
          description: 'Hand-cut russet potatoes tossed with Italian white truffle oil, sea salt, aged parmesan, and roasted garlic aioli.',
          price: 11.99,
          imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
          isAvailable: true,
          isTodaySpecial: true,
          sortOrder: 1,
        },
        {
          name: 'Crispy Calamari Rings',
          description: 'Lightly battered tender squid rings fried golden brown, served with lemon herb dip and spicy marinara.',
          price: 14.50,
          imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80',
          isAvailable: true,
          isTodaySpecial: false,
          sortOrder: 2,
        },
        {
          name: 'Burrata Caprese Salad',
          description: 'Fresh Italian burrata cheese, heirloom tomatoes, fresh basil leaves, extra virgin olive oil, and balsamic glaze.',
          price: 13.99,
          imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?auto=format&fit=crop&w=800&q=80',
          isAvailable: true,
          isTodaySpecial: true,
          sortOrder: 3,
        },
      ],
    },
    {
      name: 'Main Entrees',
      slug: 'mains',
      description: 'Chef signature dishes crafted with prime ingredients',
      sortOrder: 2,
      items: [
        {
          name: 'Prime Ribeye Steak (12oz)',
          description: 'Pan-seared USDA prime ribeye steak served with rosemary herb butter, truffle mashed potatoes, and grilled asparagus.',
          price: 34.99,
          imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
          isAvailable: true,
          isTodaySpecial: true,
          sortOrder: 1,
        },
        {
          name: 'Grilled Salmon Teriyaki',
          description: 'Wild-caught Norwegian salmon glazed with sweet teriyaki sauce, served over jasmine rice and wok-steamed bok choy.',
          price: 26.50,
          imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
          isAvailable: true,
          isTodaySpecial: true,
          sortOrder: 2,
        },
        {
          name: 'Smokey Bacon Cheeseburger',
          description: 'Angus beef patty, crispy smoked bacon, melted sharp cheddar, caramelized onions, bibb lettuce, and secret sauce on brioche.',
          price: 17.99,
          imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
          isAvailable: true,
          isTodaySpecial: false,
          sortOrder: 3,
        },
      ],
    },
    {
      name: 'Artisan Pizzas',
      slug: 'pizzas',
      description: 'Wood-fired sourdough pizzas with authentic Italian toppings',
      sortOrder: 3,
      items: [
        {
          name: 'Neapolitan Margherita',
          description: 'San Marzano tomato sauce, fresh mozzarella di bufala, organic basil, and EVOO cooked in our 800° wood oven.',
          price: 16.99,
          imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
          isAvailable: true,
          isTodaySpecial: true,
          sortOrder: 1,
        },
        {
          name: 'Spicy Pepperoni & Honey',
          description: 'Crispy cup pepperoni, mozzarella, tomato sauce, finished with crushed red pepper and hot artisanal honey drizzle.',
          price: 18.99,
          imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
          isAvailable: true,
          isTodaySpecial: false,
          sortOrder: 2,
        },
        {
          name: 'Truffle Wild Mushroom Pizza',
          description: 'Garlic cream base, roasted cremini and shiitake mushrooms, fontina cheese, fresh thyme, and white truffle oil.',
          price: 19.50,
          imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
          isAvailable: false,
          isTodaySpecial: false,
          sortOrder: 3,
        },
      ],
    },
    {
      name: 'Desserts',
      slug: 'desserts',
      description: 'Sweet Indulgences made in-house daily',
      sortOrder: 4,
      items: [
        {
          name: 'Classic Italian Tiramisu',
          description: 'Savoiardi ladyfingers soaked in espresso & dark rum, layered with rich whipped mascarpone cream and dusted with dark cocoa.',
          price: 8.99,
          imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
          isAvailable: true,
          isTodaySpecial: true,
          sortOrder: 1,
        },
        {
          name: 'Molten Lava Chocolate Cake',
          description: 'Warm chocolate cake with a gooey molten chocolate core, served with Madagascar vanilla bean ice cream and raspberry coulis.',
          price: 9.50,
          imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
          isAvailable: true,
          isTodaySpecial: false,
          sortOrder: 2,
        },
      ],
    },
    {
      name: 'Craft Drinks',
      slug: 'drinks',
      description: 'Refreshing mocktails, craft sodas, & hot beverages',
      sortOrder: 5,
      items: [
        {
          name: 'Fresh Mint Berry Lemonade',
          description: 'Muddled fresh mint leaves, wild raspberries, freshly squeezed lemons, sparkling water, and pure cane syrup.',
          price: 5.99,
          imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
          isAvailable: true,
          isTodaySpecial: true,
          sortOrder: 1,
        },
        {
          name: 'Iced Vanilla Caramel Latte',
          description: 'Double shot espresso, Madagascar vanilla bean syrup, cold whole milk, over ice with caramel drizzle.',
          price: 6.50,
          imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
          isAvailable: true,
          isTodaySpecial: false,
          sortOrder: 2,
        },
      ],
    },
  ];

  for (const catData of categories) {
    const { items, ...categoryInfo } = catData;
    const category = await prisma.category.create({
      data: categoryInfo,
    });

    for (const item of items) {
      await prisma.menuItem.create({
        data: {
          ...item,
          categoryId: category.id,
        },
      });
    }
  }

  console.log('✅ Categories and Menu Items created');

  // 6. Sample Initial Orders
  const ribeye = await prisma.menuItem.findFirst({ where: { name: { contains: 'Ribeye' } } });
  const fries = await prisma.menuItem.findFirst({ where: { name: { contains: 'Truffle' } } });
  const lemonade = await prisma.menuItem.findFirst({ where: { name: { contains: 'Lemonade' } } });

  if (ribeye && fries && lemonade) {
    const sampleOrder1 = await prisma.order.create({
      data: {
        orderNumber: 1001,
        tableNumber: 4,
        customerName: 'Sarah M.',
        totalAmount: ribeye.price + lemonade.price,
        status: 'PREPARING',
        notes: 'Steak medium-rare please.',
        items: {
          create: [
            { menuItemId: ribeye.id, quantity: 1, price: ribeye.price, notes: 'Medium rare' },
            { menuItemId: lemonade.id, quantity: 1, price: lemonade.price },
          ],
        },
      },
    });

    const sampleOrder2 = await prisma.order.create({
      data: {
        orderNumber: 1002,
        tableNumber: 12,
        customerName: 'Alex K.',
        totalAmount: fries.price + lemonade.price,
        status: 'PENDING',
        notes: 'Extra aioli dip on the side.',
        items: {
          create: [
            { menuItemId: fries.id, quantity: 1, price: fries.price, notes: 'Extra crispy' },
            { menuItemId: lemonade.id, quantity: 1, price: lemonade.price },
          ],
        },
      },
    });

    console.log('✅ Sample orders created (#1001 and #1002)');
  }

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
