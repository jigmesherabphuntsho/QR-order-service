import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export const initSocket = (io: SocketIOServer) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log('⚡ Socket connected:', socket.id);

    // Join order specific room for live customer tracking
    socket.on('join_order_room', (orderId: string) => {
      socket.join(`order_${orderId}`);
      console.log(`📌 Socket ${socket.id} joined room order_${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });
};

export const emitNewOrder = (order: any) => {
  if (ioInstance) {
    ioInstance.emit('new_order', order);
  }
};

export const emitOrderStatusUpdate = (order: any) => {
  if (ioInstance) {
    // Broadcast to admin dashboard
    ioInstance.emit('order_status_updated', order);
    // Broadcast to specific order room for customer live tracker
    ioInstance.to(`order_${order.id}`).emit('order_status_updated', order);
  }
};
