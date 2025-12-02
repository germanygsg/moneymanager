import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/user/preferences - Get user preferences
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                currentLedgerId: true,
                darkMode: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Get preferences error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching preferences' },
            { status: 500 }
        );
    }
}

// PATCH /api/user/preferences - Update user preferences
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { currentLedgerId, darkMode } = body;

        const updateData: { currentLedgerId?: string | null; darkMode?: boolean } = {};

        if (currentLedgerId !== undefined) {
            updateData.currentLedgerId = currentLedgerId;
        }

        if (darkMode !== undefined) {
            updateData.darkMode = darkMode;
        }

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                currentLedgerId: true,
                darkMode: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Update preferences error:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating preferences' },
            { status: 500 }
        );
    }
}
