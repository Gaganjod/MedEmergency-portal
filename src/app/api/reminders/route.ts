import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Reminder from '@/lib/models/Reminder';
import jwt from 'jsonwebtoken';

function getUserFromToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const reminders = await Reminder.find({ userId, isActive: true }).sort({ time: 1 });
    return NextResponse.json({ success: true, reminders });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, dosage, time, frequency, notes } = body;

    if (!name || !dosage || !time) {
      return NextResponse.json({ success: false, error: 'Name, dosage and time are required' }, { status: 400 });
    }

    await connectToDatabase();
    const reminder = await Reminder.create({
      userId,
      name,
      dosage,
      time,
      frequency: frequency || 'daily',
      notes,
    });

    return NextResponse.json({ success: true, reminder });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json({ success: false, error: 'Failed to create reminder' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, taken, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Reminder ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const updateData: Record<string, unknown> = { ...updates };
    if (typeof taken === 'boolean') {
      updateData.taken = taken;
      updateData.takenAt = taken ? new Date() : null;
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!reminder) {
      return NextResponse.json({ success: false, error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, reminder });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json({ success: false, error: 'Failed to update reminder' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Reminder ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false },
      { new: true }
    );

    if (!reminder) {
      return NextResponse.json({ success: false, error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete reminder' }, { status: 500 });
  }
}
