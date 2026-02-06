import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaRls: PrismaClient | undefined;
};

// Regular Prisma client (with pooling)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Separate Prisma client for RLS (no pooling, session mode)
// This ensures session variables persist for RLS policies
export const prismaRls = globalForPrisma.prismaRls ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL_NON_POOLING,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaRls = prismaRls;
}

/**
 * Get a Prisma client that sets the RLS context for the given user ID.
 * This enables Row Level Security policies to filter data based on the authenticated user.
 * Uses non-pooling connection to ensure session variables persist.
 * 
 * @param userId - The ID of the authenticated user
 * @returns Prisma client with RLS context set
 */
export async function getPrismaWithRLS(userId: string) {
  // Set the session variable for RLS policies to use
  await prismaRls.$executeRawUnsafe(
    `SET LOCAL app.current_user_id = '${userId.replace(/'/g, "''")}'`
  );
  return prismaRls;
}

/**
 * Execute a function with RLS context in a transaction.
 * This ensures all queries within the transaction have the correct user context.
 * Uses non-pooling connection to ensure session variables persist.
 * 
 * @param userId - The ID of the authenticated user
 * @param fn - Function that receives a Prisma client with RLS context
 * @returns Result of the function
 */
export async function withRLS<T>(
  userId: string,
  fn: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return await prismaRls.$transaction(async (tx) => {
    // Set the session variable for this transaction
    await tx.$executeRawUnsafe(
      `SET LOCAL app.current_user_id = '${userId.replace(/'/g, "''")}'`
    );
    return await fn(tx as PrismaClient);
  });
}
