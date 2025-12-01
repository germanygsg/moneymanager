import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { username, role = 'editor' } = await request.json();

        if (!username) {
            return NextResponse.json(
                { error: 'Username is required' },
                { status: 400 }
            );
        }

        // Find the user to invite
        const userToInvite = await prisma.user.findUnique({
            where: { username },
        });

        if (!userToInvite) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (userToInvite.id === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot invite yourself' },
                { status: 400 }
            );
        }

        // Get the current user's ledger
        const ledger = await prisma.ledger.findFirst({
            where: { ownerId: session.user.id },
        });

        if (!ledger) {
            return NextResponse.json(
                { error: 'Ledger not found' },
                { status: 404 }
            );
        }

        // Check if user is already invited
        const existingInvite = await prisma.ledgerUser.findUnique({
            where: {
                ledgerId_userId: {
                    ledgerId: ledger.id,
                    userId: userToInvite.id,
                },
            },
        });

        if (existingInvite) {
            return NextResponse.json(
                { error: 'User already has access to this ledger' },
                { status: 409 }
            );
        }

        // Create the invitation
        const ledgerUser = await prisma.ledgerUser.create({
            data: {
                ledgerId: ledger.id,
                userId: userToInvite.id,
                role,
            },
            include: {
                user: {
                    select: {
                        username: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: 'User invited successfully',
            ledgerUser: {
                id: ledgerUser.id,
                username: ledgerUser.user.username,
                role: ledgerUser.role,
                createdAt: ledgerUser.createdAt,
            },
        });
    } catch (error) {
        console.error('Invite error:', error);
        return NextResponse.json(
            { error: 'An error occurred while inviting user' },
            { status: 500 }
        );
    }
}

// Get list of users with access to the ledger
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the current user's ledger
        const ledger = await prisma.ledger.findFirst({
            where: { ownerId: session.user.id },
            include: {
                sharedWith: {
                    include: {
                        user: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
            },
        });

        if (!ledger) {
            return NextResponse.json(
                { error: 'Ledger not found' },
                { status: 404 }
            );
        }

        const sharedUsers = ledger.sharedWith.map((su: { id: string; user: { username: string }; role: string; createdAt: Date }) => ({
            id: su.id,
            username: su.user.username,
            role: su.role,
            createdAt: su.createdAt,
        }));

        return NextResponse.json({ sharedUsers });
    } catch (error) {
        console.error('Get shared users error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching shared users' },
            { status: 500 }
        );
    }
}
