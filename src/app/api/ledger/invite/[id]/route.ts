import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
