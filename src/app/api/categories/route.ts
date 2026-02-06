import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { withRLS } from '@/lib/prisma';

// GET /api/categories - Get all categories for the authenticated user
// RLS automatically filters to only show categories from accessible ledgers
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // With RLS, we can simply query all categories
        // The database automatically filters based on user's ledger access
        const allCategories = await withRLS(session.user.id, async (prisma) => {
            return await prisma.category.findMany();
        });

        // Format categories to match the expected frontend structure
        const formattedCategories = allCategories.map(category => ({
            id: category.id,
            name: category.name,
            type: category.type,
            color: category.color,
            icon: category.icon,
            ledgerId: category.ledgerId
        }));

        return NextResponse.json(formattedCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// POST /api/categories - Create a new category
// RLS automatically enforces editor permissions
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, type, color, icon, ledgerId } = body;

        if (!name || !type || !color || !icon || !ledgerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // RLS will automatically check if user has editor access to the ledger
        const category = await withRLS(session.user.id, async (prisma) => {
            return await prisma.category.create({
                data: {
                    name,
                    type,
                    color,
                    icon,
                    ledgerId
                }
            });
        });

        return NextResponse.json({
            id: category.id,
            name: category.name,
            type: category.type,
            color: category.color,
            icon: category.icon,
            ledgerId: category.ledgerId
        });
    } catch (error) {
        console.error('Error creating category:', error);
        if (error instanceof Error && error.message.includes('permission')) {
            return NextResponse.json({ error: 'Access denied: You need editor permissions' }, { status: 403 });
        }
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}