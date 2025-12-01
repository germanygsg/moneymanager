import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('Starting database initialization...');

    // Run prisma db push to create tables
    const { stdout, stderr } = await execAsync('npx prisma db push --skip-generate', {
      env: { ...process.env },
      timeout: 30000 // 30 seconds timeout
    });

    console.log('Database push stdout:', stdout);
    console.log('Database tables created successfully');

    return NextResponse.json({
      message: 'Database initialized successfully',
      stdout: stdout,
      stderr: stderr as string,
      status: 'success'
    });

  } catch (error) {
    console.error('Database initialization failed:', error);

    return NextResponse.json({
      error: 'Database initialization failed',
      details: error.message,
      stderr: error.stderr,
      status: 'error'
    }, { status: 500 });
  }
}