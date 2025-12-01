import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('Starting database initialization...');

    // Run prisma db push to create tables
    const { stdout } = await execAsync('npx prisma db push --skip-generate', {
      env: { ...process.env },
      timeout: 30000 // 30 seconds timeout
    });

    console.log('Database push stdout:', stdout);
    console.log('Database tables created successfully');

    return NextResponse.json(
      { message: 'Database initialized successfully', status: 'success' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Database initialization failed:', error);

    // Type guard for error object
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = error && typeof error === 'object' && 'stderr' in error
      ? (error as { stderr?: string }).stderr
      : undefined;

    return NextResponse.json({
      error: 'Database initialization failed',
      details: errorMessage,
      stderr: errorDetails,
      status: 'error'
    }, { status: 500 });
  }
}