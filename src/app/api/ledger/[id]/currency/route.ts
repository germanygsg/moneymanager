import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PATCH /api/ledger/[id]/currency - Update ledger currency
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { currency } = await request.json();

        if (!currency) {
            return NextResponse.json({ error: 'Currency is required' }, { status: 400 });
        }

        // Verify user has access to this ledger (owner or editor)
        const ledger = await prisma.ledger.findFirst({
            where: {
                id,
                ownerId: session.user.id
            }
        });

        if (!ledger) {
            return NextResponse.json(
                { error: 'Ledger not found or you do not have permission to edit it' },
                { status: 404 }
            );
        }

        // Update the ledger currency
        const updatedLedger = await prisma.ledger.update({
            where: { id },
            data: { currency },
        });

        return NextResponse.json({
            message: 'Currency updated successfully',
            ledger: {
                id: updatedLedger.id,
                currency: updatedLedger.currency,
            },
        });
    } catch (error) {
        console.error('Update currency error:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating currency' },
            { status: 500 }
        );
    }
}
