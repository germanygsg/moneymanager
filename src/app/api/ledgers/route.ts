import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { withRLS } from '@/lib/prisma';
import { DEFAULT_CATEGORIES } from '@/lib/storage';

// GET /api/ledgers - Get all ledgers for the authenticated user
// RLS automatically filters to owned and shared ledgers
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // With RLS, we can query ledgers and the database will filter automatically
        const result = await withRLS(session.user.id, async (prisma) => {
            // Get user's own ledgers
            const userLedgers = await prisma.ledger.findMany({
                where: {
                    ownerId: session.user.id
                },
                include: {
                    categories: true,
                    sharedWith: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true
                                }
                            }
                        }
                    }
                }
            });

            // Get ledgers shared with the user
            const sharedLedgers = await prisma.ledgerUser.findMany({
                where: {
                    userId: session.user.id
                },
                include: {
                    ledger: {
                        include: {
                            owner: {
                                select: {
                                    id: true,
                                    username: true
                                }
                            },
                            categories: true,
                            sharedWith: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            username: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return { userLedgers, sharedLedgers };
        });

        // Format the response
        const formattedLedgers = result.userLedgers.map((ledger) => ({
            id: ledger.id,
            name: ledger.name,
            currency: ledger.currency,
            ownerId: ledger.ownerId,
            isOwner: true,
            categories: ledger.categories.map((cat) => ({
                id: cat.id,
                name: cat.name,
                type: cat.type,
                color: cat.color,
                icon: cat.icon,
                ledgerId: cat.ledgerId
            })),
            sharedWith: ledger.sharedWith.map((lu) => ({
                userId: lu.userId,
                username: lu.user.username,
                role: lu.role
            }))
        }));

        const formattedSharedLedgers = result.sharedLedgers.map((lu) => ({
            id: lu.ledger.id,
            name: lu.ledger.name,
            currency: lu.ledger.currency,
            ownerId: lu.ledger.ownerId,
            isOwner: false,
            role: lu.role,
            categories: lu.ledger.categories.map((cat) => ({
                id: cat.id,
                name: cat.name,
                type: cat.type,
                color: cat.color,
                icon: cat.icon,
                ledgerId: cat.ledgerId
            })),
            owner: lu.ledger.owner
        }));

        return NextResponse.json([...formattedLedgers, ...formattedSharedLedgers]);
    } catch (error) {
        console.error('Error fetching ledgers:', error);
        return NextResponse.json({ error: 'Failed to fetch ledgers' }, { status: 500 });
    }
}

// POST /api/ledgers - Create a new ledger with default categories
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, currency = 'USD' } = body;

        if (!name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // RLS will automatically check permissions
        const ledger = await withRLS(session.user.id, async (prisma) => {
            return await prisma.ledger.create({
                data: {
                    name,
                    currency,
                    ownerId: session.user.id,
                    categories: {
                        create: DEFAULT_CATEGORIES.map(cat => ({
                            name: cat.name,
                            type: cat.type,
                            color: cat.color,
                            icon: cat.icon || ''
                        }))
                    }
                },
                include: {
                    categories: true
                }
            });
        });

        // Format the response
        const formattedLedger = {
            id: ledger.id,
            name: ledger.name,
            currency: ledger.currency,
            ownerId: ledger.ownerId,
            isOwner: true,
            categories: ledger.categories.map((cat) => ({
                id: cat.id,
                name: cat.name,
                type: cat.type,
                color: cat.color,
                icon: cat.icon,
                ledgerId: cat.ledgerId
            }))
        };

        return NextResponse.json(formattedLedger);
    } catch (error) {
        console.error('Error creating ledger:', error);
        return NextResponse.json({ error: 'Failed to create ledger' }, { status: 500 });
    }
}