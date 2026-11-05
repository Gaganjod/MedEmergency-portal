import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Emergency from '@/lib/models/Emergency';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const patientId = searchParams.get('patientId');

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (patientId) query.patientId = patientId;

    const emergencies = await Emergency.find(query)
      .populate('assignedHospitalId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ emergencies });
  } catch (error) {
    console.error('Get emergencies error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emergencies' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();

    const { patientName, patientPhone, emergencyType, symptoms, location } = body;

    if (!patientName || !patientPhone || !emergencyType || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const emergency = await Emergency.create({
      patientName,
      patientPhone,
      emergencyType,
      symptoms: symptoms || [],
      location,
      status: 'pending',
    });

    return NextResponse.json({
      emergency,
      message: 'Emergency request created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Create emergency error:', error);
    return NextResponse.json(
      { error: 'Failed to create emergency request' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    
    const { id, status, assignedHospitalId, assignedAmbulanceId, estimatedArrival } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Emergency ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (assignedHospitalId) updateData.assignedHospitalId = assignedHospitalId;
    if (assignedAmbulanceId) updateData.assignedAmbulanceId = assignedAmbulanceId;
    if (estimatedArrival) updateData.estimatedArrival = estimatedArrival;

    const emergency = await Emergency.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('assignedHospitalId');

    if (!emergency) {
      return NextResponse.json(
        { error: 'Emergency not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      emergency,
      message: 'Emergency updated successfully',
    });
  } catch (error) {
    console.error('Update emergency error:', error);
    return NextResponse.json(
      { error: 'Failed to update emergency' },
      { status: 500 }
    );
  }
}
