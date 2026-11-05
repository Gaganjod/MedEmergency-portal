import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Ambulance from '@/lib/models/Ambulance';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { latitude, longitude, radius = 10000 } = await req.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const ambulances = await Ambulance.find({
      isActive: true,
      status: 'available',
    })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      ambulances: ambulances.map(ambulance => ({
        id: ambulance._id.toString(),
        vehicleNumber: ambulance.vehicleNumber,
        driverName: ambulance.driverName,
        driverPhone: ambulance.driverPhone,
        status: ambulance.status,
        vehicleType: ambulance.vehicleType,
      })),
      count: ambulances.length,
    });
  } catch (error) {
    console.error('Error fetching nearby ambulances:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ambulances' },
      { status: 500 }
    );
  }
}