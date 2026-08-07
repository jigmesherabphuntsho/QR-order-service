import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'restaurant_qr_super_secret_jwt_key_2026';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  restaurantId?: string;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
