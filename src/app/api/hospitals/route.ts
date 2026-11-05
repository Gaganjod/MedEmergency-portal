import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Hospital from '@/lib/models/Hospital';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const specialization = searchParams.get('specialization');

    const query: Record<string, unknown> = {};
    if (specialization) {
      query.specializations = { $in: [specialization] };
    }

    let hospitals = await Hospital.find(query);

    if (lat && lng) {
      const hospitalsWithDistance = hospitals.map((hospital) => ({
        ...hospital.toObject(),
        distance: calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          hospital.location.lat,
          hospital.location.lng
        ),
      }));
      hospitals = hospitalsWithDistance.sort((a, b) => a.distance - b.distance) as typeof hospitals;
    }

    return NextResponse.json({ hospitals });
  } catch (error) {
    console.error('Get hospitals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hospitals' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();

    const hospital = await Hospital.create(body);

    return NextResponse.json({
      hospital,
      message: 'Hospital created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Create hospital error:', error);
    return NextResponse.json(
      { error: 'Failed to create hospital' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    
    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Hospital ID is required' },
        { status: 400 }
      );
    }

    const hospital = await Hospital.findByIdAndUpdate(id, updateData, { new: true });

    if (!hospital) {
      return NextResponse.json(
        { error: 'Hospital not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      hospital,
      message: 'Hospital updated successfully',
    });
  } catch (error) {
    console.error('Update hospital error:', error);
    return NextResponse.json(
      { error: 'Failed to update hospital' },
      { status: 500 }
    );
  }
}
