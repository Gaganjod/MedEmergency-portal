import { NextResponse } from 'next/server';

const mockCamps = [
  { id: "1", name: "Red Cross Blood Drive", venue: "Community Center, Sector 15, Noida", phone: "9876543210", conductedBy: "Red Cross Society", organizedBy: "Red Cross India", distance: 3.5, time: "09:00-17:00", date: "15-12-2025", latitude: 28.5857, longitude: 77.3100 },
  { id: "2", name: "Lions Club Camp", venue: "Lions Club Hall, Connaught Place, Delhi", phone: "9898989898", conductedBy: "Delhi Blood Bank", organizedBy: "Lions Club", distance: 5.2, time: "10:00-16:00", date: "16-12-2025", latitude: 28.6304, longitude: 77.2177 },
  { id: "3", name: "Corporate Blood Donation", venue: "Tech Park, Gurgaon", phone: "8765432109", conductedBy: "Medanta Hospital", organizedBy: "TCS Foundation", distance: 8.1, time: "11:00-15:00", date: "18-12-2025", latitude: 28.4595, longitude: 77.0266 },
  { id: "4", name: "Youth Blood Camp", venue: "University Campus, JNU, Delhi", phone: "7654321098", conductedBy: "AIIMS Blood Bank", organizedBy: "NSS Unit", distance: 10.3, time: "09:00-14:00", date: "20-12-2025", latitude: 28.5402, longitude: 77.1674 },
  { id: "5", name: "Temple Trust Camp", venue: "Akshardham Temple Complex, Delhi", phone: "6543210987", conductedBy: "Max Hospital", organizedBy: "Temple Trust", distance: 12.7, time: "08:00-13:00", date: "22-12-2025", latitude: 28.6127, longitude: 77.2773 },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { latitude, longitude } = body;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('https://apigw.umangapp.in/externalapi/ws1/eraktkoshApi/campnearby', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tkn: '1232121313213132292111',
          trkr: '213132',
          lang: 'en',
          lat: '21',
          lon: '90',
          lac: '90',
          usag: '90',
          usrid: '09',
          srvid: '90',
          mode: 'web',
          pltfrm: 'android',
          did: null,
          deptid: '98',
          deptLat: latitude?.toString() || '28.5657833',
          deptLong: longitude?.toString() || '77.3579568',
          source: 'UMANG',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await response.json();

      if (data.rs === 'S' && data.payload?.response) {
        const parsedResponse = JSON.parse(data.payload.response);
        const total = parsedResponse[0]?.TOTAL || 0;
        const camps = parsedResponse.slice(1).map((camp: {
          camp_id: string;
          name: string;
          venue: string;
          ph: string;
          conducted_by: string;
          organized_by: string;
          dis: string;
          time: string;
          dt: string;
          lat: string;
          long: string;
        }) => ({
          id: camp.camp_id,
          name: camp.name,
          venue: camp.venue,
          phone: camp.ph,
          conductedBy: camp.conducted_by,
          organizedBy: camp.organized_by,
          distance: parseFloat(camp.dis),
          time: camp.time,
          date: camp.dt,
          latitude: parseFloat(camp.lat),
          longitude: parseFloat(camp.long),
        }));

        return NextResponse.json({ success: true, total, camps });
      }
    } catch (e) {
      clearTimeout(timeout);
      console.log("eRaktKosh Camps API unavailable, using mock data");
    }

    return NextResponse.json({ success: true, total: mockCamps.length, camps: mockCamps });
  } catch (error) {
    console.error('Error fetching blood camps:', error);
    return NextResponse.json({ success: true, total: mockCamps.length, camps: mockCamps });
  }
}