import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/categories/[id] - Update a category
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, type, color, icon } = body;

        if (!name || !type || !color || !icon) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // First verify user has access to this category
        const existingCategory = await prisma.category.findFirst({
            where: {
                id: params.id,
                ledger: {
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
            }
        });

        if (!existingCategory) {
            return NextResponse.json({ error: 'Category not found or access denied' }, { status: 404 });
        }

        const updatedCategory = await prisma.category.update({
            where: {
                id: params.id
            },
            data: {
                name,
                type,
                color,
                icon
            }
        });

        // Format the response to match frontend structure
        const formattedCategory = {
            id: updatedCategory.id,
            name: updatedCategory.name,
            type: updatedCategory.type,
            color: updatedCategory.color,
            icon: updatedCategory.icon,
            ledgerId: updatedCategory.ledgerId
        };

        return NextResponse.json(formattedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // First verify user has access to this category
        const existingCategory = await prisma.category.findFirst({
            where: {
                id: params.id,
                ledger: {
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
            }
        });

        if (!existingCategory) {
            return NextResponse.json({ error: 'Category not found or access denied' }, { status: 404 });
        }

        // Check if category is being used by any transactions
        const transactionCount = await prisma.transaction.count({
            where: {
                categoryId: params.id
            }
        });

        if (transactionCount > 0) {
            return NextResponse.json({
                error: `Cannot delete category. It is being used by ${transactionCount} transaction(s).`
            }, { status: 400 });
        }

        await prisma.category.delete({
            where: {
                id: params.id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}