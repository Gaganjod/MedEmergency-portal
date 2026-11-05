import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Ambulance from '@/lib/models/Ambulance';

const indianAmbulanceDrivers = [
  { vehicleNumber: 'MH-01-AB-1234', driverName: 'Rajesh Kumar', driverPhone: '+91-98765-43210', vehicleType: 'advanced' },
  { vehicleNumber: 'MH-02-CD-5678', driverName: 'Amit Sharma', driverPhone: '+91-98765-43211', vehicleType: 'basic' },
  { vehicleNumber: 'MH-03-EF-9012', driverName: 'Suresh Patel', driverPhone: '+91-98765-43212', vehicleType: 'critical' },
  { vehicleNumber: 'DL-04-GH-3456', driverName: 'Vikram Singh', driverPhone: '+91-98765-43213', vehicleType: 'advanced' },
  { vehicleNumber: 'DL-05-IJ-7890', driverName: 'Pradeep Reddy', driverPhone: '+91-98765-43214', vehicleType: 'basic' },
  { vehicleNumber: 'KA-06-KL-2345', driverName: 'Arun Gupta', driverPhone: '+91-98765-43215', vehicleType: 'critical' },
  { vehicleNumber: 'KA-07-MN-6789', driverName: 'Ramesh Nair', driverPhone: '+91-98765-43216', vehicleType: 'advanced' },
  { vehicleNumber: 'TN-08-OP-0123', driverName: 'Sanjay Rao', driverPhone: '+91-98765-43217', vehicleType: 'basic' },
  { vehicleNumber: 'TN-09-QR-4567', driverName: 'Mahesh Iyer', driverPhone: '+91-98765-43218', vehicleType: 'critical' },
  { vehicleNumber: 'GJ-10-ST-8901', driverName: 'Deepak Desai', driverPhone: '+91-98765-43219', vehicleType: 'advanced' },
  { vehicleNumber: 'UP-11-UV-2346', driverName: 'Manoj Verma', driverPhone: '+91-98765-43220', vehicleType: 'basic' },
  { vehicleNumber: 'RJ-12-WX-6780', driverName: 'Ashok Joshi', driverPhone: '+91-98765-43221', vehicleType: 'critical' },
  { vehicleNumber: 'PB-13-YZ-0124', driverName: 'Harpreet Singh', driverPhone: '+91-98765-43222', vehicleType: 'advanced' },
  { vehicleNumber: 'WB-14-AB-4568', driverName: 'Anand Chatterjee', driverPhone: '+91-98765-43223', vehicleType: 'basic' },
  { vehicleNumber: 'AP-15-CD-8902', driverName: 'Krishna Murthy', driverPhone: '+91-98765-43224', vehicleType: 'critical' },
  { vehicleNumber: 'MP-16-EF-2347', driverName: 'Ravi Jain', driverPhone: '+91-98765-43225', vehicleType: 'advanced' },
  { vehicleNumber: 'HR-17-GH-6781', driverName: 'Naveen Kumar', driverPhone: '+91-98765-43226', vehicleType: 'basic' },
  { vehicleNumber: 'BR-18-IJ-0125', driverName: 'Ajay Sinha', driverPhone: '+91-98765-43227', vehicleType: 'critical' },
  { vehicleNumber: 'OR-19-KL-4569', driverName: 'Dinesh Mishra', driverPhone: '+91-98765-43228', vehicleType: 'advanced' },
  { vehicleNumber: 'JH-20-MN-8903', driverName: 'Pankaj Das', driverPhone: '+91-98765-43229', vehicleType: 'basic' },
];

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    await Ambulance.deleteMany({});

    const locations = [
      { lat: 19.0760, lng: 72.8777 },
      { lat: 28.7041, lng: 77.1025 },
      { lat: 12.9716, lng: 77.5946 },
      { lat: 13.0827, lng: 80.2707 },
      { lat: 23.0225, lng: 72.5714 },
      { lat: 26.9124, lng: 75.7873 },
      { lat: 30.7333, lng: 76.7794 },
      { lat: 22.5726, lng: 88.3639 },
      { lat: 17.3850, lng: 78.4867 },
      { lat: 23.2599, lng: 77.4126 },
    ];

    const ambulances = indianAmbulanceDrivers.map((driver, index) => ({
      ...driver,
      status: Math.random() > 0.3 ? 'available' : 'busy',
      currentLocation: locations[index % locations.length],
      isActive: true,
    }));

    await Ambulance.insertMany(ambulances);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${ambulances.length} ambulance drivers`,
      count: ambulances.length,
    });
  } catch (error: any) {
    console.error('Error seeding ambulances:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed ambulances' },
      { status: 500 }
    );
  }
}