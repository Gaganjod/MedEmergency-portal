import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import MedicalRecord from '@/lib/models/MedicalRecord';
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
    const records = await MedicalRecord.find({ userId }).sort({ date: -1 });
    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, date, type, doctor, hospital, notes, fileUrl } = body;

    if (!title || !date || !type) {
      return NextResponse.json({ success: false, error: 'Title, date and type are required' }, { status: 400 });
    }

    await connectToDatabase();
    const record = await MedicalRecord.create({
      userId,
      title,
      date,
      type,
      doctor,
      hospital,
      notes,
      fileUrl,
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Error creating medical record:', error);
    return NextResponse.json({ success: false, error: 'Failed to create record' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Record ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const record = await MedicalRecord.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    );

    if (!record) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Error updating medical record:', error);
    return NextResponse.json({ success: false, error: 'Failed to update record' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Record ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const record = await MedicalRecord.findOneAndDelete({ _id: id, userId });

    if (!record) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete record' }, { status: 500 });
  }
}
