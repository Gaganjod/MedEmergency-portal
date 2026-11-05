import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import AmbulanceDispatch from '@/lib/models/AmbulanceDispatch';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

// Helper stub – in a real app replace with geospatial query
async function findNearestAvailableAmbulance(lat: number, lng: number) {
  // Simulated nearest ambulance data
  return {
    ambulanceId: 'AMB-001',
    driverName: 'John Doe',
    etaMinutes: 5,
    destination: 'City General Hospital',
  };
}

function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    console.warn('No auth token provided – using fallback userId');
    return 'testUser';
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

/**
 * POST /api/ambulance/dispatch
 * Expected body: { patientId?, emergencyType, location: { lat, lng, address }, severityLevel }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    console.log('Ambulance dispatch POST called – userId:', userId);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Dispatch payload:', body);
    const { emergencyType, location, severityLevel } = body;
    if (!location?.lat || !location?.lng) {
      return NextResponse.json({ success: false, error: 'Invalid location coordinates' }, { status: 400 });
    }

    // Find nearest ambulance (stubbed)
    const nearest = await findNearestAvailableAmbulance(location.lat, location.lng);
    if (!nearest) {
      return NextResponse.json({ success: false, error: 'No ambulances available' }, { status: 503 });
    }

    await connectToDatabase();

    const dispatchRecord = await AmbulanceDispatch.create({
      dispatchId: `DISP-${Date.now()}`,
      patientId: userId,
      ambulanceId: nearest.ambulanceId,
      status: 'DISPATCHED',
      dispatchedAt: new Date(),
      etaMinutes: nearest.etaMinutes,
      destination: nearest.destination,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address ?? '',
      },
    });

    console.log('Created ambulance dispatch record:', dispatchRecord);
    return NextResponse.json({ success: true, dispatch: dispatchRecord }, { status: 201 });
  } catch (error) {
    console.error('Error in ambulance dispatch:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// Optional GET to list recent dispatches for debugging
export async function GET(request: NextRequest) {
  try {
    const userId = getUserFromToken(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await connectToDatabase();
    const records = await AmbulanceDispatch.find({ patientId: userId }).sort({ dispatchedAt: -1 }).limit(20);
    return NextResponse.json({ success: true, records });
  } catch (err) {
    console.error('GET ambulance dispatch error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}
