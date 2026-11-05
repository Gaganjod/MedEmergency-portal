import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ status: 'ok', message: 'Connected to medDb' });
  } catch (error) {
    return NextResponse.json({ status: 'error', error: (error as Error).message }, { status: 500 });
  }
}
