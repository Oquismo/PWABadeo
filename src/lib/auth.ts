import { NextRequest } from 'next/server';
import { prisma } from './prisma-client';

export interface AuthUser {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  schoolId: number | null;
}

export async function authMiddleware(req: NextRequest): Promise<AuthUser | null> {
  try {
    // Intentar obtener el usuario de la cookie
    const userCookie = req.cookies.get('user')?.value;
    
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        return {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          schoolId: userData.schoolId,
        };
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    }

    // Fallback: buscar por auth-token
    const token = req.cookies.get('auth-token')?.value;
    if (token) {
      try {
        const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
        const user = await prisma.user.findUnique({
          where: { id: tokenData.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            schoolId: true,
          },
        });
        return user;
      } catch (e) {
        console.error('Error parsing auth token:', e);
      }
    }

    return null;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return null;
  }
}

// Helper para verificar si el usuario está autenticado
export function requireAuth(user: AuthUser | null): AuthUser {
  if (!user) {
    throw new Error('No autorizado');
  }
  return user;
}
