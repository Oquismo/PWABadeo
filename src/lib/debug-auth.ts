import { prisma } from '@/lib/prisma-client';
import bcrypt from 'bcrypt';

async function debugUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        createdAt: true
      }
    });

    console.log(`👥 Found ${users.length} users:`);
    
    for (const user of users) {
      console.log({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: user.password.substring(0, 20) + '...',
        passwordLength: user.password.length,
        createdAt: user.createdAt
      });
    }

    // Verificar si las contraseñas están hasheadas con bcrypt
    for (const user of users) {
      const isBcryptHash = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
      console.log(`${user.email} - Password is bcrypt hashed: ${isBcryptHash}`);
      
      if (!isBcryptHash) {
        console.log(`⚠️  ${user.email} has plain text password: ${user.password}`);
      }
    }

    return users;
  } catch (error) {
    console.error('❌ Error checking users:', error);
    throw error;
  }
}

export { debugUsers };
