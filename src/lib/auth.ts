import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

let prisma: any = null;

// Dynamically import prisma only when needed
async function getPrismaClient() {
  if (!prisma) {
    try {
      const { prisma: prismaClient } = await import('@/lib/prisma');
      prisma = prismaClient;
    } catch (error) {
      console.error('Failed to load Prisma client:', error);
      return null;
    }
  }
  return prisma;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                try {
                    const prismaClient = await getPrismaClient();
                    if (!prismaClient) {
                        throw new Error('Database not available');
                    }

                    const user = await prismaClient.user.findUnique({
                        where: {
                            username: credentials.username,
                        },
                    });

                    if (!user) {
                        return null;
                    }

                    const isPasswordValid = await compare(credentials.password, user.password);

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user.id,
                        username: user.username,
                    };
                } catch (error) {
                    console.error('Authorization error:', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.username = token.username as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
