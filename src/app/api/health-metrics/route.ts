import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import HealthMetric from '@/lib/models/HealthMetric';
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
    const latestMetric = await HealthMetric.findOne({ userId }).sort({ recordedAt: -1 });
    
    return NextResponse.json({ success: true, metric: latestMetric });
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch health metrics' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      heartRate,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      bloodSugar,
      weight,
      height,
      temperature,
      oxygenLevel,
      notes,
    } = body;

    await connectToDatabase();
    const metric = await HealthMetric.create({
      userId,
      heartRate,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      bloodSugar,
      weight,
      height,
      temperature,
      oxygenLevel,
      notes,
    });

    return NextResponse.json({ success: true, metric }, { status: 201 });
  } catch (error) {
    console.error('Error creating health metric:', error);
    return NextResponse.json({ success: false, error: 'Failed to create health metric' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Metric ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const metric = await HealthMetric.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    );

    if (!metric) {
      return NextResponse.json({ success: false, error: 'Metric not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, metric });
  } catch (error) {
    console.error('Error updating health metric:', error);
    return NextResponse.json({ success: false, error: 'Failed to update health metric' }, { status: 500 });
  }
}
