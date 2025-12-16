import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Check ownership/permissions
        // Only owner should be able to rename the ledger
        const ledger = await prisma.ledger.findUnique({
            where: { id },
            select: { ownerId: true }
        });

        if (!ledger) {
            return NextResponse.json({ error: 'Ledger not found' }, { status: 404 });
        }

        if (ledger.ownerId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden: Only the owner can rename the ledger' }, { status: 403 });
        }

        // Update the ledger
        const updatedLedger = await prisma.ledger.update({
            where: { id },
            data: { name },
        });

        return NextResponse.json(updatedLedger);
    } catch (error) {
        console.error('Error updating ledger:', error);
        return NextResponse.json({ error: 'Failed to update ledger' }, { status: 500 });
    }
}
