import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { role } = await request.json();

        if (!role || !['editor', 'viewer'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role. Must be "editor" or "viewer"' },
                { status: 400 }
            );
        }

        // Get the ledger user entry
        const ledgerUser = await prisma.ledgerUser.findUnique({
            where: { id },
            include: {
                ledger: true,
            },
        });

        if (!ledgerUser) {
            return NextResponse.json(
                { error: 'Shared access not found' },
                { status: 404 }
            );
        }

        // Verify that the current user is the owner
        if (ledgerUser.ledger.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Only the ledger owner can update access' },
                { status: 403 }
            );
        }

        // Update the role
        const updatedLedgerUser = await prisma.ledgerUser.update({
            where: { id },
            data: { role },
            include: {
                user: {
                    select: {
                        username: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: 'Role updated successfully',
            ledgerUser: {
                id: updatedLedgerUser.id,
                username: updatedLedgerUser.user.username,
                role: updatedLedgerUser.role,
                createdAt: updatedLedgerUser.createdAt,
            },
        });
    } catch (error) {
        console.error('Update role error:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating role' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Get the ledger user entry
        const ledgerUser = await prisma.ledgerUser.findUnique({
            where: { id },
            include: {
                ledger: true,
            },
        });

        if (!ledgerUser) {
            return NextResponse.json(
                { error: 'Shared access not found' },
                { status: 404 }
            );
        }

        // Verify that the current user is the owner
        if (ledgerUser.ledger.ownerId !== session.user.id) {
            return NextResponse.json(
                { error: 'Only the ledger owner can remove access' },
                { status: 403 }
            );
        }

        // Remove the access
        await prisma.ledgerUser.delete({
            where: { id },
        });

        return NextResponse.json({
            message: 'Access removed successfully',
        });
    } catch (error) {
        console.error('Remove access error:', error);
        return NextResponse.json(
            { error: 'An error occurred while removing access' },
            { status: 500 }
        );
    }
}
