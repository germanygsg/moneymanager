import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/categories - Get all categories for the authenticated user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's ledgers and their categories
        const userLedgers = await prisma.ledger.findMany({
            where: {
                ownerId: session.user.id
            },
            include: {
                categories: true
            }
        });

        // Also check for shared ledgers
        const sharedLedgers = await prisma.ledgerUser.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                ledger: {
                    include: {
                        categories: true
                    }
                }
            }
        });

        // Combine all categories from user's ledgers and shared ledgers
        const allCategories = [
            ...userLedgers.flatMap((ledger) => ledger.categories),
            ...sharedLedgers.flatMap((lu) => lu.ledger.categories)
        ];

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

        // Verify user has access to the ledger
        const ledger = await prisma.ledger.findFirst({
            where: {
                id: ledgerId,
                OR: [
                    { ownerId: session.user.id },
                    {
                        sharedWith: {
                            some: {
                                userId: session.user.id
                            }
                        }
                    }
                ]
            }
        });

        if (!ledger) {
            return NextResponse.json({ error: 'Ledger not found or access denied' }, { status: 404 });
        }

        const category = await prisma.category.create({
            data: {
                name,
                type,
                color,
                icon,
                ledgerId
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
    }
}