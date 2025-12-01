import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        if (username.length < 3) {
            return NextResponse.json(
                { error: 'Username must be at least 3 characters' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if username exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 12);

        // Create user and their default ledger
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                ownedLedgers: {
                    create: {
                        name: 'My Ledger',
                        currency: 'USD',
                        categories: {
                            create: [
                                // Default Income Categories
                                { name: 'Salary', type: 'Income', icon: '💼', color: '#27ae60' },
                                { name: 'Freelance', type: 'Income', icon: '💻', color: '#3498db' },
                                { name: 'Investment', type: 'Income', icon: '📈', color: '#9b59b6' },
                                { name: 'Gift', type: 'Income', icon: '🎁', color: '#e67e22' },
                                { name: 'Other Income', type: 'Income', icon: '💰', color: '#1abc9c' },

                                // Default Expense Categories
                                { name: 'Food & Dining', type: 'Expense', icon: '🍔', color: '#e74c3c' },
                                { name: 'Transportation', type: 'Expense', icon: '🚗', color: '#f39c12' },
                                { name: 'Shopping', type: 'Expense', icon: '🛒', color: '#9b59b6' },
                                { name: 'Entertainment', type: 'Expense', icon: '🎬', color: '#3498db' },
                                { name: 'Bills & Utilities', type: 'Expense', icon: '📱', color: '#e67e22' },
                                { name: 'Healthcare', type: 'Expense', icon: '🏥', color: '#1abc9c' },
                                { name: 'Education', type: 'Expense', icon: '📚', color: '#34495e' },
                                { name: 'Other Expense', type: 'Expense', icon: '💸', color: '#95a5a6' },
                            ],
                        },
                    },
                },
            },
        });

        return NextResponse.json({
            message: 'User created successfully',
            userId: user.id,
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'An error occurred during signup' },
            { status: 500 }
        );
    }
}
