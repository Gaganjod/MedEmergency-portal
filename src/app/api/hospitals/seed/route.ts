import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Hospital from '@/lib/models/Hospital';

const seedHospitals = [
  {
    name: 'City General Hospital',
    address: '123 Healthcare Avenue, Medical District',
    location: { lat: 40.7128, lng: -74.006 },
    phone: '+1-555-0101',
    email: 'contact@citygeneral.com',
    specializations: ['Cardiology', 'Neurology', 'Orthopedics', 'Emergency Medicine'],
    rating: 4.8,
    waitTime: 15,
    availableBeds: 45,
    totalBeds: 200,
    ambulanceCount: 8,
    isEmergencyAvailable: true,
  },
  {
    name: 'Metro Medical Center',
    address: '456 Wellness Boulevard, Downtown',
    location: { lat: 40.7589, lng: -73.9851 },
    phone: '+1-555-0102',
    email: 'info@metromedical.com',
    specializations: ['Oncology', 'Pediatrics', 'Gynecology', 'Trauma'],
    rating: 4.6,
    waitTime: 25,
    availableBeds: 32,
    totalBeds: 150,
    ambulanceCount: 6,
    isEmergencyAvailable: true,
  },
  {
    name: 'Sunrise Health Institute',
    address: '789 Care Street, Eastside',
    location: { lat: 40.7484, lng: -73.9857 },
    phone: '+1-555-0103',
    email: 'hello@sunrisehealth.com',
    specializations: ['Internal Medicine', 'Dermatology', 'Psychiatry', 'Radiology'],
    rating: 4.7,
    waitTime: 20,
    availableBeds: 28,
    totalBeds: 120,
    ambulanceCount: 4,
    isEmergencyAvailable: true,
  },
];

export async function POST() {
  try {
    await connectToDatabase();
    
    const existingCount = await Hospital.countDocuments();
    
    if (existingCount > 0) {
      return NextResponse.json({
        message: 'Database already seeded',
        count: existingCount,
      });
    }

    const hospitals = await Hospital.insertMany(seedHospitals);

    return NextResponse.json({
      message: 'Database seeded successfully',
      hospitals,
    }, { status: 201 });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
