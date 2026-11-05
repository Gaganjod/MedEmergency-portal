import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import VolunteerDonor from '@/lib/models/VolunteerDonor';

export async function GET() {
  try {
    await connectToDatabase();
    const donors = await VolunteerDonor.find({ isAvailable: true })
      .sort({ totalDonations: -1 })
      .limit(7);
    return NextResponse.json({ success: true, donors });
  } catch (error) {
    console.error('Error fetching volunteer donors:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch donors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    if (body.action === 'register') {
      const { name, phone, bloodType } = body;
      
      if (!name || !phone || !bloodType) {
        return NextResponse.json({ success: false, error: 'Name, phone, and blood type are required' }, { status: 400 });
      }

      const existingDonor = await VolunteerDonor.findOne({ phone });
      if (existingDonor) {
        return NextResponse.json({ success: false, error: 'Phone number already registered' }, { status: 400 });
      }

      const newDonor = await VolunteerDonor.create({
        name,
        phone,
        bloodType,
        isAvailable: true,
        totalDonations: 0,
        lastDonationDate: null,
        city: 'Unknown',
      });

      return NextResponse.json({ success: true, message: 'Registered successfully', donor: newDonor });
    }
    
    if (body.action === 'seed') {
      const existingCount = await VolunteerDonor.countDocuments();
      if (existingCount > 0) {
        return NextResponse.json({ success: true, message: 'Donors already seeded', count: existingCount });
      }

      const indianDonors = [
        { name: 'Rajesh Kumar', phone: '+91 98765 43210', bloodType: 'A+', totalDonations: 15, lastDonationDate: '2024-10-15', city: 'Mumbai' },
        { name: 'Priya Sharma', phone: '+91 87654 32109', bloodType: 'O-', totalDonations: 12, lastDonationDate: '2024-11-02', city: 'Delhi' },
        { name: 'Amit Patel', phone: '+91 76543 21098', bloodType: 'B+', totalDonations: 8, lastDonationDate: '2024-09-20', city: 'Ahmedabad' },
        { name: 'Sunita Reddy', phone: '+91 65432 10987', bloodType: 'AB+', totalDonations: 6, lastDonationDate: '2024-11-10', city: 'Hyderabad' },
        { name: 'Vikram Singh', phone: '+91 54321 09876', bloodType: 'O+', totalDonations: 20, lastDonationDate: '2024-10-28', city: 'Jaipur' },
        { name: 'Anjali Nair', phone: '+91 43210 98765', bloodType: 'A-', totalDonations: 10, lastDonationDate: '2024-11-05', city: 'Kochi' },
        { name: 'Suresh Menon', phone: '+91 32109 87654', bloodType: 'B-', totalDonations: 5, lastDonationDate: '2024-08-15', city: 'Bangalore' },
      ];

      await VolunteerDonor.insertMany(indianDonors.map(d => ({ ...d, isAvailable: true })));
      return NextResponse.json({ success: true, message: 'Donors seeded successfully', count: indianDonors.length });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in volunteer donors API:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}